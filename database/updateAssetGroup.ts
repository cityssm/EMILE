import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { AssetGroup } from '../types/recordTypes.js'

export async function updateAssetGroup(
  group: AssetGroup,
  sessionUser: EmileUser
): Promise<boolean> {
  const emileDB = await getConnectionWhenAvailable()

  const result = emileDB
    .prepare(
      `update AssetGroups
        set groupName = ?,
        groupDescription = ?,
        isShared = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and groupId = ?`
    )
    .run(
      group.groupName,
      group.groupDescription,
      group.isShared,
      sessionUser.userName,
      Date.now(),
      group.groupId
    )

  emileDB.close()

  return result.changes > 0
}
