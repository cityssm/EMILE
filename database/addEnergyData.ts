import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyData } from '../types/recordTypes.js'

export function addEnergyData(
  data: EnergyData,
  sessionUser: EmileUser
): number {
  const emileDB = sqlite(databasePath)

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into EnergyData (
        assetId, dataTypeId, fileId,
        timeSeconds, durationSeconds, dataValue,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.assetId,
      data.dataTypeId,
      data.fileId,
      data.timeSeconds,
      data.durationSeconds,
      data.dataValue,
      sessionUser.userName,
      rightNowMillis,
      sessionUser.userName,
      rightNowMillis
    )

  emileDB.close()

  return result.lastInsertRowid as number
}
