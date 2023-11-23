// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { EnergyCommodity } from '../types/recordTypes.js'

export async function getEnergyCommodity(
  filterField: 'commodityId' | 'commodity' | 'greenButtonId',
  filterValue: string,
  connectedEmileDB?: sqlite.Database
): Promise<EnergyCommodity | undefined> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true))

  const commodity = emileDB
    .prepare(
      `select commodityId, commodity, greenButtonId
        from EnergyCommodities
        where recordDelete_timeMillis is null
        and ${filterField} = ?`
    )
    .get(filterValue) as EnergyCommodity | undefined

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return commodity
}
