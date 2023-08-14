import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

export function deleteEnergyData(
  dataId: number | string,
  sessionUser: EmileUser
): boolean {
  const emileDB = sqlite(databasePath)

  const result = emileDB
    .prepare(
      `update EnergyData
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and dataId = ?`
    )
    .run(sessionUser.userName, Date.now(), dataId)

  emileDB.close()

  return result.changes > 0
}

export function deleteEnergyDataByFileId(
  fileId: number | string,
  sessionUser: EmileUser
): boolean {
  const emileDB = sqlite(databasePath)

  const result = emileDB
    .prepare(
      `update EnergyData
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`
    )
    .run(sessionUser.userName, Date.now(), fileId)

  emileDB.close()

  return result.changes > 0
}
