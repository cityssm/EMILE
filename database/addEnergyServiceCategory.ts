import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { EnergyServiceCategory } from '../types/recordTypes.js'

export async function addEnergyServiceCategory(
  serviceCategory: Partial<EnergyServiceCategory>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<number> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into EnergyServiceCategories (
        serviceCategory, greenButtonId, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      serviceCategory.serviceCategory,
      serviceCategory.greenButtonId,
      serviceCategory.orderNumber ?? 0,
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
