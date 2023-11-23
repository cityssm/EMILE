// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { EnergyUnit } from '../types/recordTypes.js'

export async function getEnergyUnit(
  filterField: 'unitId' | 'unit' | 'greenButtonId',
  filterValue: string,
  connectedEmileDB?: sqlite.Database
): Promise<EnergyUnit | undefined> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true))

  const unit = emileDB
    .prepare(
      `select unitId, unit, unitLong, greenButtonId
        from EnergyUnits
        where recordDelete_timeMillis is null
        and ${filterField} = ?`
    )
    .get(filterValue) as EnergyUnit | undefined

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return unit
}
