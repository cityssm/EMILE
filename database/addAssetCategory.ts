import type sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/functions.cache.js'
import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { AssetCategory } from '../types/recordTypes.js'

export async function addAssetCategory(
  category: Partial<AssetCategory>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<number> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

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
