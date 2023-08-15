// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyServiceCategory } from '../types/recordTypes.js'

export function getEnergyServiceCategoryByGreenButtonId(
  serviceCategoryGreenButtonId: string,
  connectedEmileDB?: sqlite.Database
): EnergyServiceCategory | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const serviceCategory = emileDB
    .prepare(
      `select serviceCategoryId, serviceCategory, greenButtonId
        from EnergyServiceCategories
        where recordDelete_timeMillis is null
        and greenButtonId = ?`
    )
    .get(serviceCategoryGreenButtonId) as EnergyServiceCategory

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return serviceCategory
}
