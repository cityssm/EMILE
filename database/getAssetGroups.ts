import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { AssetGroup } from '../types/recordTypes.js'

export async function getAssetGroups(
  sessionUser: EmileUser
): Promise<AssetGroup[]> {
  const emileDB = await getConnectionWhenAvailable(true)

  const assetGroups = emileDB
    .prepare(
      `select g.groupId, g.groupName, g.groupDescription, g.isShared, g.recordCreate_userName,
        count(m.assetId) as groupMemberCount
        from AssetGroups g
        left join AssetGroupMembers m on g.groupId = m.groupId
          and m.recordDelete_timeMillis is null
          and m.assetId in (select assetId from Assets where recordDelete_timeMillis is null)
        where g.recordDelete_timeMillis is null
          and (g.recordCreate_userName = ? or g.isShared = 1)
        group by g.groupId, g.groupName, g.groupDescription, g.isShared, g.recordCreate_userName
        order by g.groupName, g.groupId`
    )
    .all(sessionUser.userName) as AssetGroup[]

  emileDB.close()

  return assetGroups
}
