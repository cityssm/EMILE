import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

import { deleteAssetAliases } from './deleteAssetAliases.js'
import { deleteAssetGroupMembersByAssetId } from './deleteAssetGroupMember.js'

export async function deleteAsset(
  assetId: number | string,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<boolean> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  const result = emileDB
    .prepare(
      `update Assets
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and assetId = ?`
    )
    .run(sessionUser.userName, Date.now(), assetId)

  if (result.changes > 0) {
    await deleteAssetAliases('assetId', assetId, sessionUser, emileDB)
    await deleteAssetGroupMembersByAssetId(assetId, sessionUser, emileDB)
  }

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return result.changes > 0
}
