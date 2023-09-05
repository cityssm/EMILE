import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/functions.cache.js'
import { databasePath } from '../helpers/functions.database.js'
import type { AssetCategory } from '../types/recordTypes.js'

export function addAssetCategory(
  category: Partial<AssetCategory>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): number {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into AssetCategories (
        category, fontAwesomeIconClasses, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      category.category,
      category.fontAwesomeIconClasses ?? 'fas fa-bolt',
      category.orderNumber ?? -1,
      sessionUser.userName,
      rightNowMillis,
      sessionUser.userName,
      rightNowMillis
    )

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  clearCacheByTableName('AssetCategories')

  return result.lastInsertRowid as number
}
