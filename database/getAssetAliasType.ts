import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { AssetAliasType } from '../types/recordTypes.js'

export function getAssetAliasTypeByAliasTypeKey(
  aliasTypeKey: string
): AssetAliasType | undefined {
  try {
    const emileDB = sqlite(databasePath, {
      readonly: true
    })

    const assetAliasType = emileDB
      .prepare(
        `select aliasTypeId, aliasType, regularExpression, aliasTypeKey
        from AssetAliasTypes
        where recordDelete_timeMillis is null
        and aliasTypeKey = ?`
      )
      .get(aliasTypeKey) as AssetAliasType | undefined

    emileDB.close()

    return assetAliasType
  } catch {
    return undefined
  }
}
