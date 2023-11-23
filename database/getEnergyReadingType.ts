// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { EnergyReadingType } from '../types/recordTypes.js'

export async function getEnergyReadingType(
  filterField: 'readingTypeId' | 'readingType' | 'greenButtonId',
  filterValue: string,
  connectedEmileDB?: sqlite.Database
): Promise<EnergyReadingType | undefined> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true))

  const readingType = emileDB
    .prepare(
      `select readingTypeId, readingType, greenButtonId
        from EnergyReadingTypes
        where recordDelete_timeMillis is null
        and ${filterField} = ?`
    )
    .get(filterValue) as EnergyReadingType | undefined

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return readingType
}
