import cluster from 'node:cluster'

import Debug from 'debug'

import { getAssetAliasTypes as getAssetAliasTypesFromDatabase } from '../database/getAssetAliasTypes.js'
import { getAssetCategories as getAssetCategoriesFromDatabase } from '../database/getAssetCategories.js'
import type {
  ClearCacheWorkerMessage,
  CacheTableName
} from '../types/applicationTypes.js'
import type { AssetAliasType, AssetCategory } from '../types/recordTypes.js'

const debug = Debug(`emile:functions.cache:${process.pid}`)

/*
 * Asset Categories
 */

let assetCategories: AssetCategory[] = []

export function getAssetCategories(): AssetCategory[] {
  if (assetCategories.length === 0) {
    debug('Cache miss: AssetCategories')
    assetCategories = getAssetCategoriesFromDatabase()
  }

  return assetCategories
}

/*
 * Asset Alias Types
 */

let assetAliasTypes: AssetAliasType[] = []

export function getAssetAliasTypes(): AssetAliasType[] {
  if (assetAliasTypes.length === 0) {
    debug('Cache miss: AssetAliasTypes')
    assetAliasTypes = getAssetAliasTypesFromDatabase()
  }

  return assetAliasTypes
}

/*
 * Clear Caches
 */

export function clearCacheByTableName(
  tableName: CacheTableName,
  relayMessage = true
): void {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (tableName) {
    case 'AssetAliasTypes': {
      assetAliasTypes = []
      break
    }
    case 'AssetCategories': {
      assetCategories = []
      break
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      debug(`Ignoring clear cache for unknown table: ${tableName}`)
    }
  }

  try {
    if (relayMessage && cluster.isWorker && process.send !== undefined) {
      const workerMessage: ClearCacheWorkerMessage = {
        messageType: 'clearCache',
        tableName,
        timeMillis: Date.now(),
        pid: process.pid
      }

      debug(`Sending clear cache from worker: ${tableName}`)

      process.send(workerMessage)
    }
  } catch {
    debug('Error sending clear cache message.')
  }
}

/*
 * Respond to messaging
 */

process.on('message', (message: ClearCacheWorkerMessage) => {
  if (message.messageType === 'clearCache' && message.pid !== process.pid) {
    debug(`Clearing cache: ${message.tableName}`)
    clearCacheByTableName(message.tableName, false)
  }
})
