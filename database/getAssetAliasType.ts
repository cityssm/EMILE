import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { AssetAliasType } from '../types/recordTypes.js'

export async function getAssetAliasTypeByAliasTypeKey(
  aliasTypeKey: string,
  connectedEmileDB?: sqlite.Database
): Promise<AssetAliasType | undefined> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true))

  try {
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const assetAliasType = emileDB
      .prepare(
        `select aliasTypeId, aliasType, regularExpression, aliasTypeKey
          from AssetAliasTypes
          where recordDelete_timeMillis is null
          and aliasTypeKey = ?`
      )
      .get(aliasTypeKey) as AssetAliasType | undefined

    return assetAliasType
  } catch {
    return undefined
  } finally {
    if (connectedEmileDB === undefined) {
      emileDB.close()
    }
  }
}
