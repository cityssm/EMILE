import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/functions.cache.js'
import { databasePath } from '../helpers/functions.database.js'
import type { AssetCategory } from '../types/recordTypes.js'

export function updateAssetCategory(
  category: Partial<AssetCategory>,
  sessionUser: EmileUser
): boolean {
  const emileDB = sqlite(databasePath)

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `update AssetCategories
        set category = ?,
        fontAwesomeIconClasses = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and categoryId = ?`
    )
    .run(
      category.category,
      category.fontAwesomeIconClasses ?? 'fas fa-bolt',
      sessionUser.userName,
      rightNowMillis,
      category.categoryId
    )

  emileDB.close()

  clearCacheByTableName('AssetCategories')

  return result.changes > 0
}
