// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyAccumulationBehaviour } from '../types/recordTypes.js'

export function getEnergyAccumulationBehaviourByGreenButtonId(
  accumulationBehaviourGreenButtonId: string,
  connectedEmileDB?: sqlite.Database
): EnergyAccumulationBehaviour | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const accumulationBehaviour = emileDB
    .prepare(
      `select accumulationBehaviourId, accumulationBehaviour, greenButtonId
        from EnergyAccumulationBehaviours
        where recordDelete_timeMillis is null
        and greenButtonId = ?`
    )
    .get(accumulationBehaviourGreenButtonId) as EnergyAccumulationBehaviour

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return accumulationBehaviour
}

export function getEnergyAccumulationBehaviourByName(
  accumulationBehaviourName: string,
  connectedEmileDB?: sqlite.Database
): EnergyAccumulationBehaviour | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const accumulationBehaviour = emileDB
    .prepare(
      `select accumulationBehaviourId, accumulationBehaviour, greenButtonId
        from EnergyAccumulationBehaviours
        where recordDelete_timeMillis is null
        and accumulationBehaviour = ?`
    )
    .get(accumulationBehaviourName) as EnergyAccumulationBehaviour

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return accumulationBehaviour
}
