// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { EnergyAccumulationBehaviour } from '../types/recordTypes.js'

export async function getEnergyAccumulationBehaviour(
  filterField:
    | 'accumulationBehaviourId'
    | 'accumulationBehaviour'
    | 'greenButtonId',
  filterValue: string,
  connectedEmileDB?: sqlite.Database
): Promise<EnergyAccumulationBehaviour | undefined> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true))

  const accumulationBehaviour = emileDB
    .prepare(
      `select accumulationBehaviourId, accumulationBehaviour, greenButtonId
        from EnergyAccumulationBehaviours
        where recordDelete_timeMillis is null
        and ${filterField} = ?`
    )
    .get(filterValue) as EnergyAccumulationBehaviour | undefined

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return accumulationBehaviour
}
