// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { Asset } from '../types/recordTypes.js'

import { getAssetAliases } from './getAssetAliases.js'

export function getAsset(
  assetId: string | number,
  connectedEmileDB?: sqlite.Database
): Asset | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const asset = emileDB
    .prepare(
      `select a.assetId, a.assetName, a.latitude, a.longitude,
        a.categoryId, c.category, c.fontAwesomeIconClasses
        from Assets a
        left join AssetCategories c on a.categoryId = c.categoryId
        where a.recordDelete_timeMillis is null
        and a.assetId = ?`
    )
    .get(assetId) as Asset | undefined

  if (asset !== undefined) {
    asset.assetAliases = getAssetAliases(
      {
        assetId: asset.assetId as number
      },
      emileDB
    )
  }

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return asset
}

export function getAssetByAssetAlias(
  assetAlias: string,
  aliasTypeId?: number | string,
  connectedEmileDB?: sqlite.Database
): Asset | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  let sql = `select assetId from AssetAliases
    where recordDelete_timeMillis is null
    and assetAlias = ?`

  const sqlParameters: unknown[] = [assetAlias]

  if (aliasTypeId !== undefined) {
    sql += ' and aliasTypeId = ?'
    sqlParameters.push(aliasTypeId)
  }

  let asset: Asset | undefined

  const assetId = emileDB.prepare(sql).get(sqlParameters) as
    | { assetId: number }
    | undefined

  if (assetId !== undefined) {
    asset = getAsset(assetId.assetId, emileDB)
  }

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return asset
}
