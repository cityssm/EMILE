import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { AssetAliasType } from '../types/recordTypes.js'

export function addAssetAliasType(
  aliasType: Partial<AssetAliasType>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): number {
  const emileDB = connectedEmileDB ?? sqlite(databasePath)

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into AssetAliasTypes (
        aliasType, regularExpression, aliasTypeKey, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      aliasType.aliasType,
      aliasType.regularExpression ?? '',
      aliasType.aliasTypeKey ?? '',
      aliasType.orderNumber ?? 0,
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
