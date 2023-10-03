import type sqlite from 'better-sqlite3'
import Debug from 'debug'

import { clearCacheByTableName } from '../helpers/functions.cache.js'
import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import { delay } from '../helpers/functions.utilities.js'
import type { EnergyData } from '../types/recordTypes.js'

import { ensureEnergyDataTableExists } from './manageEnergyDataTables.js'
import { updateAssetTimeSeconds } from './updateAsset.js'

const debug = Debug('emile:database:addEnergyData')

export async function addEnergyData(
  data: Partial<EnergyData>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<number> {
  const emileDB =
    connectedEmileDB === undefined
      ? await getConnectionWhenAvailable()
      : connectedEmileDB

  let result: sqlite.RunResult

  while (true) {
    try {
      const rightNowMillis = Date.now()

      const tableName = await ensureEnergyDataTableExists(
        data.assetId as number
      )

      result = emileDB
        .prepare(
          `insert into ${tableName} (
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
      debug('Waiting 1 second ...')
      await delay(1000)
    }
  }

  await updateAssetTimeSeconds(data.assetId as number, emileDB)

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  clearCacheByTableName('EnergyData')

  return result.lastInsertRowid as number
}
