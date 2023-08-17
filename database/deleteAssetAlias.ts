import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

export function deleteAssetAlias(
  aliasId: number | string,
  sessionUser: EmileUser
): boolean {
  const emileDB = sqlite(databasePath)

  const result = emileDB
    .prepare(
      `update AssetAliases
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and aliasId = ?`
    )
    .run(sessionUser.userName, Date.now(), aliasId)

  emileDB.close()

  return result.changes > 0
}
