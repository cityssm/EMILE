// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyReadingType } from '../types/recordTypes.js'

export function getEnergyReadingTypeByGreenButtonId(
  readingTypeGreenButtonId: string,
  connectedEmileDB?: sqlite.Database
): EnergyReadingType | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const readingType = emileDB
    .prepare(
      `select readingTypeId, readingType, greenButtonId
        from EnergyReadingTypes
        where recordDelete_timeMillis is null
        and greenButtonId = ?`
    )
    .get(readingTypeGreenButtonId) as EnergyReadingType

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return readingType
}

export function getEnergyReadingTypeByName(
  readingTypeName: string,
  connectedEmileDB?: sqlite.Database
): EnergyReadingType | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const readingType = emileDB
    .prepare(
      `select readingTypeId, readingType, greenButtonId
        from EnergyReadingTypes
        where recordDelete_timeMillis is null
        and readingType = ?`
    )
    .get(readingTypeName) as EnergyReadingType

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return readingType
}
