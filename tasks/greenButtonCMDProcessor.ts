/* eslint-disable eslint-comments/disable-enable-pair, unicorn/filename-case */
/* eslint-disable @typescript-eslint/indent */

import fs from 'node:fs'

import { helpers as greenButtonHelpers } from '@cityssm/green-button-parser'
import type { GreenButtonJson } from '@cityssm/green-button-parser/types/entryTypes.js'
import { GreenButtonSubscriber } from '@cityssm/green-button-subscriber'
import Debug from 'debug'
import exitHook from 'exit-hook'
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/fixed'

import { getConfigProperty } from '../helpers/functions.config.js'
import { recordGreenButtonData } from '../helpers/functions.greenButton.js'

const debug = Debug('emile:tasks:greenButtonCMDProcessor')

process.title = 'EMILE - greenButtonCMDProcessor'

/*
 * Task
 */

const taskIntervalMillis = 3600 * 1000
const pollingIntervalMillis = 86_400 * 1000 + 60_000

const updatedMinsCacheFile = 'data/caches/greenButtonCMDProcessor.json'

let updatedMins: Record<
  string,
  Record<string, { polledMillis: number; updatedMillis: number }>
> = {}

try {
  updatedMins = JSON.parse(
    fs.readFileSync(updatedMinsCacheFile) as unknown as string
  )
} catch {
  debug(`No cache file available: ${updatedMinsCacheFile}`)
  updatedMins = {}
}

let terminateTask = false
let taskIsRunning = false

function saveCache(): void {
  try {
    fs.writeFileSync(
      updatedMinsCacheFile,
      JSON.stringify(updatedMins, undefined, 2)
    )
  } catch (error) {
    debug(`Error saving cache file: ${updatedMinsCacheFile}`)
    debug(error)
  }
}

async function processGreenButtonSubscriptions(): Promise<void> {
  if (taskIsRunning) {
    return
  }

  debug('Process started')
  taskIsRunning = true

  try {
    const greenButtonSubscriptions = getConfigProperty(
      'subscriptions.greenButton'
    )

    // eslint-disable-next-line no-labels
    subscriptionLoop: for (const [
      subscriptionKey,
      greenButtonSubscription
    ] of Object.entries(greenButtonSubscriptions)) {
      if (terminateTask) {
        break
      }

      if (
        (greenButtonSubscription.pollingHoursToExclude ?? []).includes(
          new Date().getHours()
        )
      ) {
        debug(`Subscription cannot be polled at this hour: ${subscriptionKey}`)
        continue
      }

      debug(`Loading authorizations for subscription: ${subscriptionKey} ...`)

      if (updatedMins[subscriptionKey] === undefined) {
        updatedMins[subscriptionKey] = {}
      }

      const greenButtonSubscriber = new GreenButtonSubscriber(
        greenButtonSubscription.configuration
      )

      const authorizations = await greenButtonSubscriber.getAuthorizations()

      if (authorizations === undefined) {
        debug(`Unable to retieve authorizations: ${subscriptionKey}`)
        continue
      }

      const authorizationEntries = greenButtonHelpers.getEntriesByContentType(
        authorizations.json as GreenButtonJson,
        'Authorization'
      )

      if (authorizationEntries.length === 0) {
        debug(`Subscription contains no authorizations: ${subscriptionKey}`)
        continue
      }

      for (const authorizationEntry of authorizationEntries) {
        if (
          (greenButtonSubscription.pollingHoursToExclude ?? []).includes(
            new Date().getHours()
          )
        ) {
          debug(
            `Subscription cannot be polled at this hour: ${subscriptionKey}`
          )

          // eslint-disable-next-line no-labels
          continue subscriptionLoop
        }

        const authorizationId = authorizationEntry.links.selfUid ?? ''

        if (
          authorizationId === '' ||
          (greenButtonSubscription.authorizationIdsToExclude ?? []).includes(
            authorizationId
          ) ||
          (greenButtonSubscription.authorizationIdsToInclude !== undefined &&
            !greenButtonSubscription.authorizationIdsToInclude.includes(
              authorizationId
            )) ||
          authorizationEntry.content.Authorization.status_value !== 'Active'
        ) {
          debug(
            `Skipping authorization id: ${subscriptionKey}, ${authorizationId}`
          )
          continue
        }

        let timeMillis = updatedMins[subscriptionKey][authorizationId]

        if (timeMillis === undefined) {
          timeMillis = {
            polledMillis: 0,
            updatedMillis: 0
          }
        } else if (typeof timeMillis === 'number') {
          timeMillis = {
            polledMillis: timeMillis,
            updatedMillis: timeMillis
          }
        }

        if (timeMillis.polledMillis + pollingIntervalMillis > Date.now()) {
          debug(
            `Skipping recently refreshed authorization id: ${subscriptionKey}, ${authorizationId}`
          )
          continue
        }

        let updatedMin: Date

        if (timeMillis.updatedMillis === 0) {
          updatedMin = new Date()
          updatedMin.setFullYear(updatedMin.getFullYear() - 1)
        } else {
          updatedMin = new Date(timeMillis.updatedMillis)
        }

        const usageData =
          await greenButtonSubscriber.getBatchSubscriptionsByAuthorization(
            authorizationId,
            {
              updatedMin
            }
          )

        if (usageData === undefined) {
          debug(
            `Unable to retrieve subscription data: ${subscriptionKey}, ${authorizationId}`
          )
          continue
        }

        try {
          await recordGreenButtonData(usageData.json as GreenButtonJson, {})
        } catch (error) {
          debug(`Error recording data: ${subscriptionKey}, ${authorizationId}`)
          debug(error)
        } finally {
          updatedMins[subscriptionKey][authorizationId] = {
            polledMillis: Date.now(),
            updatedMillis:
              usageData.json?.updatedDate?.getTime() ??
              timeMillis.updatedMillis ??
              0
          }
          saveCache()
        }
      }
    }
  } finally {
    taskIsRunning = false
  }
}

/*
 * Run the task
 */

await processGreenButtonSubscriptions().catch((error) => {
  debug('Error running task.')
  debug(error)
})

const intervalID = setIntervalAsync(
  processGreenButtonSubscriptions,
  taskIntervalMillis
)

exitHook(() => {
  terminateTask = true
  try {
    void clearIntervalAsync(intervalID)
  } catch {
    debug('Error exiting task.')
  }
})
