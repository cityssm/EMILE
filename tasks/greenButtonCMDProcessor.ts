/* eslint-disable eslint-comments/disable-enable-pair, unicorn/filename-case */

import fs from 'node:fs'

import { helpers as greenButtonHelpers } from '@cityssm/green-button-parser'
import * as greenButtonSubscriber from '@cityssm/green-button-subscriber'
import Debug from 'debug'
import exitHook from 'exit-hook'
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async'

import { getConfigProperty } from '../helpers/functions.config.js'
import { recordGreenButtonData } from '../helpers/functions.greenButton.js'

const debug = Debug('emile:tasks:greenButtonCMDProcessor')

/*
 * Task
 */

const pollingIntervalMillis = (86_400 * 1000) + 60_000

const updatedMinsCacheFile = 'data/caches/greenButtonCMDProcessor.json'

let updatedMins: Record<string, number> = {}

try {
  updatedMins = JSON.parse(
    fs.readFileSync(updatedMinsCacheFile) as unknown as string
  )
} catch {
  debug(`No cache file available: ${updatedMinsCacheFile}`)
  updatedMins = {}
}

let terminateTask = false

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
  debug('Process started')

  const greenButtonSubscriptions = getConfigProperty(
    'subscriptions.greenButton'
  )

  for (const [subscriptionKey, greenButtonSubscription] of Object.entries(
    greenButtonSubscriptions
  )) {
    if (terminateTask) {
      break
    }

    debug(`Loading authorizations for subscription: ${subscriptionKey} ...`)

    greenButtonSubscriber.setConfiguration(
      greenButtonSubscription.configuration
    )

    const authorizations = await greenButtonSubscriber.getAuthorizations()

    if (authorizations === undefined) {
      debug(`Unable to retieve authorizations: ${subscriptionKey}`)
      continue
    }

    const entries = greenButtonHelpers.getEntriesByContentType(
      authorizations,
      'Authorization'
    )

    if (entries.length === 0) {
      debug(`Subscription contains no authorizations: ${subscriptionKey}`)
      continue
    }

    for (const entry of entries) {
      const authorizationId = entry.links.selfUid ?? ''

      if (
        authorizationId === '' ||
        (greenButtonSubscription.authorizationIdsToExclude ?? []).includes(
          authorizationId
        ) ||
        (greenButtonSubscription.authorizationIdsToInclude !== undefined &&
          !greenButtonSubscription.authorizationIdsToInclude.includes(
            authorizationId
          )) ||
        entry.content.Authorization.status_value !== 'Active'
      ) {
        debug(
          `Skipping authorization id: ${subscriptionKey}, ${authorizationId}`
        )
        continue
      }

      const updatedMinMillis = updatedMins[authorizationId]
      let updatedMin: Date

      if ((updatedMinMillis ?? undefined) === undefined) {
        updatedMin = new Date()
        updatedMin.setFullYear(updatedMin.getFullYear() - 1)
      } else {
        updatedMin = new Date(updatedMinMillis)
      }

      if (updatedMin.getTime() + pollingIntervalMillis > Date.now()) {
        debug(
          `Skipping recently refreshed authorization id: ${subscriptionKey}, ${authorizationId}`
        )
        continue
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
        recordGreenButtonData(usageData, {})
        updatedMins[authorizationId] = usageData.updatedDate?.getTime() ?? 0
        saveCache()
      } catch (error) {
        debug(`Error recording data: ${subscriptionKey}, ${authorizationId}`)
        debug(error)
      }
    }
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
  pollingIntervalMillis
)

exitHook(() => {
  terminateTask = true
  try {
    void clearIntervalAsync(intervalID)
  } catch {
    debug('Error exiting task.')
  }
})