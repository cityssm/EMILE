import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

export async function deleteAssetGroupMember(
  groupId: number | string,
  assetId: number | string,
  sessionUser: EmileUser
): Promise<boolean> {
  const emileDB = await getConnectionWhenAvailable()

  const result = emileDB
    .prepare(
      `update AssetGroupMembers
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and groupId = ?
        and assetId = ?`
    )
    .run(sessionUser.userName, Date.now(), groupId, assetId)

  emileDB.close()

  return result.changes > 0
}

export async function deleteAssetGroupMembersByAssetId(
  assetId: number | string,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<boolean> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  const result = emileDB
    .prepare(
      `update AssetGroupMembers
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and assetId = ?`
    )
    .run(sessionUser.userName, Date.now(), assetId)

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return result.changes > 0
}

export async function deleteAssetGroupMembersByGroupId(
  groupId: number | string,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<boolean> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  const result = emileDB
    .prepare(
      `update AssetGroupMembers
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and groupId = ?`
    )
    .run(sessionUser.userName, Date.now(), groupId)

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return result.changes > 0
}
