import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { EnergyCommodity } from '../types/recordTypes.js'

export async function addEnergyCommodity(
  commodity: Partial<EnergyCommodity>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<number> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into EnergyCommodities (
        commodity, greenButtonId, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      commodity.commodity,
      commodity.greenButtonId,
      commodity.orderNumber ?? 0,
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
