import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

export function updateEnergyDataValue(
  data: {
    dataId: number
    fileId?: number
    dataValue: number
    powerOfTenMultiplier: number
  },
  sessionUser: EmileUser
): boolean {
  const emileDB = sqlite(databasePath)

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `update EnergyData
        set fileId = ?,
        dataValue = ?,
        powerOfTenMultiplier = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where dataId = ?`
    )
    .run(
      data.fileId,
      data.dataValue,
      data.powerOfTenMultiplier ?? 0,
      sessionUser.userName,
      rightNowMillis,
      data.dataId
    )

  emileDB.close()

  return result.changes > 0
}
