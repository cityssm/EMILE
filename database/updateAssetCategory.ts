import { clearCacheByTableName } from '../helpers/functions.cache.js'
import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { AssetCategory } from '../types/recordTypes.js'

export async function updateAssetCategory(
  category: Partial<AssetCategory>,
  sessionUser: EmileUser
): Promise<boolean> {
  const emileDB = await getConnectionWhenAvailable()

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
