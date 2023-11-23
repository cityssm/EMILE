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

const lastUpdatedMinsCacheFile = 'data/caches/greenButtonCMDProcessor.json'

const greenButtonSubscriptions = getConfigProperty('subscriptions.greenButton')

interface LastUpdateMins {
  polledMillis: number
  updatedMillis: number
}

let lastUpdatedMins: Record<string, Record<string, LastUpdateMins>> = {}

try {
  lastUpdatedMins = JSON.parse(
    fs.readFileSync(lastUpdatedMinsCacheFile) as unknown as string
  )
} catch {
  debug(`No cache file available: ${lastUpdatedMinsCacheFile}`)
  lastUpdatedMins = {}
}

let terminateTask = false
let taskIsRunning = false

function saveCache(): void {
  try {
    fs.writeFileSync(
      lastUpdatedMinsCacheFile,
      JSON.stringify(lastUpdatedMins, undefined, 2)
    )
  } catch (error) {
    debug(`Error saving cache file: ${lastUpdatedMinsCacheFile}`)
    debug(error)
  }
}

function getLastPolledAndUpdatedMillis(
  subscriptionKey: string,
  authorizationId: string
): LastUpdateMins {
  let timeMillis = lastUpdatedMins[subscriptionKey][authorizationId]

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

  return timeMillis
}

async function processGreenButtonSubscriptions(): Promise<void> {
  if (taskIsRunning) {
    return
  }

  debug('Process started')
  taskIsRunning = true

  try {
    // eslint-disable-next-line no-labels
    subscriptionLoop: for (const [
      subscriptionKey,
      greenButtonSubscription
    ] of Object.entries(greenButtonSubscriptions)) {
      if (terminateTask) {
        break
      }

      /*
       * Ensure subscription is within the allowable polling time range.
       */

      if (
        (greenButtonSubscription.pollingHoursToExclude ?? []).includes(
          new Date().getHours()
        )
      ) {
        debug(`Subscription cannot be polled at this hour: ${subscriptionKey}`)
        continue
      }

      debug(`Loading authorizations for subscription: ${subscriptionKey} ...`)

      /*
       * Ensure a time cache record exists for the subscription.
       */

      if (lastUpdatedMins[subscriptionKey] === undefined) {
        lastUpdatedMins[subscriptionKey] = {}
      }

      const greenButtonSubscriber = new GreenButtonSubscriber(
        greenButtonSubscription.configuration
      )

      /*
       * Get the Authorizations for the subscription.
       */

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

        /*
         * Ensure the Authorization is supposed to be polled.
         */

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

        /*
         * Ensure the Authorization was not polled too recently.
         */

        const timeMillis = getLastPolledAndUpdatedMillis(
          subscriptionKey,
          authorizationId
        )

        if (timeMillis.polledMillis + pollingIntervalMillis > Date.now()) {
          debug(
            `Skipping recently refreshed authorization id: ${subscriptionKey}, ${authorizationId}`
          )
          continue
        }

        /*
         * Calculate the last updated time that should be used for retrieving data.
         */

        let updatedMin: Date

        if (timeMillis.updatedMillis === 0) {
          updatedMin = new Date()
          updatedMin.setFullYear(updatedMin.getFullYear() - 1)
        } else {
          updatedMin = new Date(timeMillis.updatedMillis)
        }

        /*
         * Poll for usage data.
         */

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

        /*
         * Record the usage data.
         */

        try {
          await recordGreenButtonData(
            usageData.json as GreenButtonJson,
            {}
          )
        } catch (error) {
          debug(`Error recording data: ${subscriptionKey}, ${authorizationId}`)
          debug(error)
        } finally {
          lastUpdatedMins[subscriptionKey][authorizationId] = {
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
