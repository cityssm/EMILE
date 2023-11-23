import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { AssetAliasType } from '../types/recordTypes.js'

export async function getAssetAliasTypes(): Promise<AssetAliasType[]> {
  const emileDB = await getConnectionWhenAvailable(true)

  const assetAliasTypes = emileDB
    .prepare(
      `select aliasTypeId, aliasType, regularExpression, aliasTypeKey
        from AssetAliasTypes
        where recordDelete_timeMillis is null
        order by orderNumber, aliasType`
    )
    .all() as AssetAliasType[]

  emileDB.close()

  return assetAliasTypes
}
