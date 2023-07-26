import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { AssetCategory } from '../types/recordTypes.js'

export function addAssetCategory(
  category: AssetCategory,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): number {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into AssetCategories (
        category, fontAwesomeIconClasses,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_millis)
        values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      category.category,
      category.fontAwesomeIconClasses ?? 'fas fa-bolt',
      sessionUser.userName,
      rightNowMillis,
      sessionUser.userName,
      rightNowMillis
    )

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return result.lastInsertRowid as number
}
