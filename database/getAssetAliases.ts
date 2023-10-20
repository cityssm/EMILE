// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { AssetAlias } from '../types/recordTypes.js'

interface GetAssetAliasesFilters {
  assetId?: string | number
}

export function getAssetAliases(
  filters: GetAssetAliasesFilters,
  connectedEmileDB?: sqlite.Database
): AssetAlias[] {
  let sql = `select a.aliasId, a.assetId, a.assetAlias,
    a.aliasTypeId, t.aliasType
    from AssetAliases a
    left join AssetAliasTypes t on a.aliasTypeId = t.aliasTypeId
    where a.recordDelete_timeMillis is null`

  const sqlParameters: unknown[] = []

  if ((filters.assetId ?? '') === '') {
    sql +=
      ' and a.assetId in (select assetId from Assets where recordDelete_timeMillis is null)'
  } else {
    sql += ' and a.assetId = ?'
    sqlParameters.push(filters.assetId ?? '')
  }

  sql += ' order by t.orderNumber, t.aliasType, a.assetId, a.assetAlias'

  const emileDB =
    connectedEmileDB ??
    sqlite(databasePath, {
      readonly: true
    })

  const assetAliases = emileDB.prepare(sql).all(sqlParameters) as AssetAlias[]

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return assetAliases
}
