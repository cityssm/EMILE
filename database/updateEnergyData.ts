import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/functions.cache.js'
import { databasePath } from '../helpers/functions.database.js'

import {
  ensureEnergyDataTablesExists,
  refreshAggregatedEnergyDataTables
} from './manageEnergyDataTables.js'

export async function updateEnergyDataValue(
  data: {
    dataId: number
    assetId: number
    fileId?: number
    dataValue: number
    powerOfTenMultiplier: number
  },
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<boolean> {
  const emileDB = connectedEmileDB ?? sqlite(databasePath)

  const tableNames = await ensureEnergyDataTablesExists(data.assetId)

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `update ${tableNames.raw}
        set fileId = ?,
        dataValue = ?,
        powerOfTenMultiplier = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where dataId = ?
        and assetId = ?`
    )
    .run(
      data.fileId,
      data.dataValue,
      data.powerOfTenMultiplier ?? 0,
      sessionUser.userName,
      rightNowMillis,
      data.dataId,
      data.assetId
    )

  refreshAggregatedEnergyDataTables(data.assetId, emileDB)

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  clearCacheByTableName('EnergyData')

  return result.changes > 0
}
