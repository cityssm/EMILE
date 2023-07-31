// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { Asset } from '../types/recordTypes.js'

interface GetAssetsFilters {
  groupId?: number | string
}

export function getAssets(
  filters: GetAssetsFilters = {},
  connectedEmileDB?: sqlite.Database
): Asset[] {
  let sql = `select a.assetId, a.assetName, a.latitude, a.longitude,
    a.categoryId, c.category, c.fontAwesomeIconClasses
    from Assets a
    left join AssetCategories c on a.categoryId = c.categoryId
    where a.recordDelete_timeMillis is null`

  const sqlParameters: unknown[] = []

  if ((filters.groupId ?? '') !== '') {
    sql += ` and a.assetId in (
          select g.assetId from AssetGroupMembers g
          where g.recordDelete_timeMillis is null
          and g.groupId = ?
        )`
    sqlParameters.push(filters.groupId)
  }

  sql += ' order by c.orderNumber, c.category, a.assetName'

  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const assets = emileDB.prepare(sql).all(sqlParameters) as Asset[]

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return assets
}
