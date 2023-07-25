import sqlite from 'better-sqlite3'

import { emileDB as databasePath } from '../helpers/functions.database.js'
import type { EnergyUnit } from '../types/recordTypes.js'

export function addEnergyUnit(
  unit: EnergyUnit,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): number {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into EnergyUnits (
        unit, unitLong, greenButtonId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_millis)
        values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      unit.unit,
      unit.unitLong ?? unit.unit,
      unit.greenButtonId,
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
