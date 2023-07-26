import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyReadingType } from '../types/recordTypes.js'

export function addEnergyReadingType(
  readingType: EnergyReadingType,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): number {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into EnergyReadingTypes (
        readingType, greenButtonId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      readingType.readingType,
      readingType.greenButtonId,
      sessionUser.userName,
      rightNowMillis,
      sessionUser.userName,
      rightNowMillis
    )

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return result.lastInsertRowid as number
}
