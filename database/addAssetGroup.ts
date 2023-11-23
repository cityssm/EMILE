import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { AssetGroup } from '../types/recordTypes.js'

export async function addAssetGroup(
  group: Partial<AssetGroup>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<number> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into AssetGroups (
        groupName, groupDescription, isShared,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      group.groupName,
      group.groupDescription ?? '',
      group.isShared ?? false ? 1 : 0,
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
