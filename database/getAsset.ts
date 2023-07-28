import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { Asset } from '../types/recordTypes.js'

import { getAssetAliases } from './getAssetAliases.js'

export function getAsset(assetId: string | number): Asset | undefined {
  const emileDB = sqlite(databasePath)

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
        assetId: asset.assetId
      },
      emileDB
    )
  }

  emileDB.close()

  return asset
}
