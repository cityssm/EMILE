// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyUnit } from '../types/recordTypes.js'

export function getEnergyUnitByGreenButtonId(
  unitGreenButtonId: string,
  connectedEmileDB?: sqlite.Database
): EnergyUnit | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const unit = emileDB
    .prepare(
      `select unitId, unit, unitLong, greenButtonId
        from EnergyUnits
        where recordDelete_timeMillis is null
        and greenButtonId = ?`
    )
    .get(unitGreenButtonId) as EnergyUnit

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return unit
}

export function getEnergyUnitByName(
  unitName: string,
  connectedEmileDB?: sqlite.Database
): EnergyUnit | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const unit = emileDB
    .prepare(
      `select unitId, unit, unitLong, greenButtonId
        from EnergyUnits
        where recordDelete_timeMillis is null
        and (unit = ? or unitLong = ?)`
    )
    .get(unitName, unitName) as EnergyUnit

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return unit
}
