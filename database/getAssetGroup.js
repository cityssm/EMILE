import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { getAssets } from './getAssets.js';
export async function getAssetGroup(groupId, sessionUser) {
    const emileDB = await getConnectionWhenAvailable();
    const assetGroup = emileDB
        .prepare(`select g.groupId, g.groupName, g.groupDescription, g.isShared, g.recordCreate_userName
        from AssetGroups g
        where g.recordDelete_timeMillis is null
          and g.groupId = ?
          and (g.recordCreate_userName = ? or g.isShared = 1)`)
        .get(groupId, sessionUser.userName);
    if (assetGroup !== undefined) {
        assetGroup.groupMembers = await getAssets({ groupId: assetGroup.groupId }, {}, emileDB);
    }
    emileDB.close();
    return assetGroup;
}
