import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

export function deleteAssetGroupMember(
  groupId: number | string,
  assetId: number | string,
  sessionUser: EmileUser
): boolean {
  const emileDB = sqlite(databasePath)

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

export function deleteAssetGroupMembersByAssetId(
  assetId: number | string,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): boolean {
  const emileDB = connectedEmileDB ?? sqlite(databasePath)

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

export function deleteAssetGroupMembersByGroupId(
  groupId: number | string,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): boolean {
  const emileDB = connectedEmileDB ?? sqlite(databasePath)

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
