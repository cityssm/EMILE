// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyCommodity } from '../types/recordTypes.js'

export function getEnergyCommodityByGreenButtonId(
  commodityGreenButtonId: string,
  connectedEmileDB?: sqlite.Database
): EnergyCommodity | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const commodity = emileDB
    .prepare(
      `select commodityId, commodity, greenButtonId
        from EnergyCommodities
        where recordDelete_timeMillis is null
        and greenButtonId = ?`
    )
    .get(commodityGreenButtonId) as EnergyCommodity

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return commodity
}
