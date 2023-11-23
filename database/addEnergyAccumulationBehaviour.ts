import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { EnergyAccumulationBehaviour } from '../types/recordTypes.js'

export async function addEnergyAccumulationBehaviour(
  accumulationBehaviour: Partial<EnergyAccumulationBehaviour>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<number> {
  const emileDB = connectedEmileDB ?? await getConnectionWhenAvailable()

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into EnergyAccumulationBehaviours (
        accumulationBehaviour, greenButtonId, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      accumulationBehaviour.accumulationBehaviour,
      accumulationBehaviour.greenButtonId,
      accumulationBehaviour.orderNumber ?? 0,
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
