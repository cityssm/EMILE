import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { EnergyDataType } from '../types/recordTypes.js'

export async function addEnergyDataType(
  energyDataType: Partial<EnergyDataType>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<number> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

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
