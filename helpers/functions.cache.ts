import cluster from 'node:cluster'

import Debug from 'debug'

import { getAssetAliasTypes as getAssetAliasTypesFromDatabase } from '../database/getAssetAliasTypes.js'
import { getAssetCategories as getAssetCategoriesFromDatabase } from '../database/getAssetCategories.js'
import {
  type EnergyDataStatistics,
  getEnergyDataStatistics as getEnergyDataStatisticsFromDatabase
} from '../database/getEnergyDataStatistics.js'
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

export async function getAssetCategories(): Promise<AssetCategory[]> {
  if (assetCategories.length === 0) {
    debug('Cache miss: AssetCategories')
    assetCategories = await getAssetCategoriesFromDatabase()
  }

  return assetCategories
}

/*
 * Asset Alias Types
 */

let assetAliasTypes: AssetAliasType[] = []

export async function getAssetAliasTypes(): Promise<AssetAliasType[]> {
  if (assetAliasTypes.length === 0) {
    debug('Cache miss: AssetAliasTypes')
    assetAliasTypes = await getAssetAliasTypesFromDatabase()
  }

  return assetAliasTypes
}

/*
 * Energy Data Statistics
 */

let energyDataStatistics: EnergyDataStatistics | undefined

export async function getEnergyDataStatistics(): Promise<EnergyDataStatistics> {
  if (energyDataStatistics === undefined) {
    debug('Cache miss: EnergyDataStatistics')
    energyDataStatistics = await getEnergyDataStatisticsFromDatabase()
  }
  return energyDataStatistics
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
    case 'EnergyData': {
      energyDataStatistics = undefined
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
