import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { AssetCategory } from '../types/recordTypes.js'

export function getAssetCategories(): AssetCategory[] {
  const emileDB = sqlite(databasePath)

  const assetCategories = emileDB
    .prepare(
      `select categoryId, category, fontAwesomeIconClasses
        from AssetCategories
        where recordDelete_timeMillis is null
        order by category`
    )
    .all() as AssetCategory[]

  emileDB.close()

  return assetCategories
}
