import sqlite from 'better-sqlite3'

import { emileDB as databasePath } from '../helpers/functions.database.js'
import type { EnergyAccumulationBehaviour } from '../types/recordTypes.js'

export function addEnergyAccumulationBehaviour(
  accumulationBehaviour: EnergyAccumulationBehaviour,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): number {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into EnergyAccumulationBehaviours (
        accumulationBehaviour, greenButtonId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_millis)
        values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      accumulationBehaviour.accumulationBehaviour,
      accumulationBehaviour.greenButtonId,
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
