// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { EnergyServiceCategory } from '../types/recordTypes.js'

export async function getEnergyServiceCategory(
  filterField: 'serviceCategoryId' | 'serviceCategory' | 'greenButtonId',
  filterValue: string,
  connectedEmileDB?: sqlite.Database
): Promise<EnergyServiceCategory | undefined> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true))

  const serviceCategory = emileDB
    .prepare(
      `select serviceCategoryId, serviceCategory, greenButtonId
        from EnergyServiceCategories
        where recordDelete_timeMillis is null
        and ${filterField} = ?`
    )
    .get(filterValue) as EnergyServiceCategory | undefined

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return serviceCategory
}
