import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { AssetAliasType } from '../types/recordTypes.js'

export function getAssetAliasTypes(): AssetAliasType[] {
  const emileDB = sqlite(databasePath, {
    readonly: true
  })

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
