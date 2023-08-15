import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyDataType } from '../types/recordTypes.js'

export function addEnergyDataType(
  energyDataType: EnergyDataType,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): number {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into EnergyDataTypes (
        serviceCategoryId, unitId, readingTypeId, commodityId, accumulationBehaviourId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      energyDataType.serviceCategoryId,
      energyDataType.unitId,
      energyDataType.readingTypeId,
      energyDataType.commodityId,
      energyDataType.accumulationBehaviourId,
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
