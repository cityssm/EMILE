import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyServiceCategory } from '../types/recordTypes.js'

export function addEnergyServiceCategory(
  serviceCategory: EnergyServiceCategory,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): number {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into EnergyServiceCategories (
        serviceCategory, greenButtonId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_millis)
        values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      serviceCategory.serviceCategory,
      serviceCategory.greenButtonId,
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
