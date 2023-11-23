import { clearCacheByTableName } from '../helpers/functions.cache.js'
import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

export async function deleteAssetCategory(
  categoryId: number | string,
  sessionUser: EmileUser
): Promise<boolean> {
  const emileDB = await getConnectionWhenAvailable()

  const result = emileDB
    .prepare(
      `update AssetCategories
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and categoryId = ?`
    )
    .run(sessionUser.userName, Date.now(), categoryId)

  emileDB.close()

  clearCacheByTableName('AssetCategories')

  return result.changes > 0
}
