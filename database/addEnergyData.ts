import type sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/functions.cache.js'
import {
  getConnectionWhenAvailable,
  queryMaxRetryCount
} from '../helpers/functions.database.js'
import { delay } from '../helpers/functions.utilities.js'
import type { EnergyData } from '../types/recordTypes.js'

import {
  ensureEnergyDataTablesExists,
  refreshAggregatedEnergyDataTables
} from './manageEnergyDataTables.js'
import { updateAssetTimeSeconds } from './updateAsset.js'

export async function addEnergyData(
  data: Partial<EnergyData>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<number | undefined> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  let result: sqlite.RunResult | undefined

  for (let count = 0; count <= queryMaxRetryCount; count += 1) {
    try {
      const rightNowMillis = Date.now()

      const tableNames = await ensureEnergyDataTablesExists(
        data.assetId as number
      )

      result = emileDB
        .prepare(
          `insert into ${tableNames.raw} (
            assetId, dataTypeId, fileId,
            timeSeconds, durationSeconds, dataValue, powerOfTenMultiplier,
            recordCreate_userName, recordCreate_timeMillis,
            recordUpdate_userName, recordUpdate_timeMillis)
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          data.assetId,
          data.dataTypeId,
          data.fileId,
          data.timeSeconds,
          data.durationSeconds,
          data.dataValue,
          data.powerOfTenMultiplier ?? 0,
          sessionUser.userName,
          rightNowMillis,
          sessionUser.userName,
          rightNowMillis
        )

      // exit loop when successful
      break
    } catch {
      await delay(500, 'addEnergyData')
    }
  }

  if (result === undefined) {
    throw new Error(
      `Database still locked after ${queryMaxRetryCount} retries.`
    )
  } else {
    await updateAssetTimeSeconds(data.assetId as number, emileDB)

    refreshAggregatedEnergyDataTables(data.assetId as number, emileDB)

    if (connectedEmileDB === undefined) {
      emileDB.close()
    }

    clearCacheByTableName('EnergyData')

    return result.lastInsertRowid as number
  }
}
