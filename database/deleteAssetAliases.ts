import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

export async function deleteAssetAliases(
  filterField: 'aliasId' | 'assetId',
  filterValue: number | string,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<boolean> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  const result = emileDB
    .prepare(
      `update AssetAliases
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and ${filterField} = ?`
    )
    .run(sessionUser.userName, Date.now(), filterValue)

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return result.changes > 0
}
