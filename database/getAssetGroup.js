import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
import { getAssets } from './getAssets.js';
export function getAssetGroup(groupId, sessionUser) {
    const emileDB = sqlite(databasePath, {
        readonly: true
    });
    const assetGroup = emileDB
        .prepare(`select g.groupId, g.groupName, g.groupDescription, g.isShared, g.recordCreate_userName
        from AssetGroups g
        where g.recordDelete_timeMillis is null
          and g.groupId = ?
          and (g.recordCreate_userName = ? or g.isShared = 1)`)
        .get(groupId, sessionUser.userName);
    if (assetGroup !== undefined) {
        assetGroup.groupMembers = getAssets({ groupId: assetGroup.groupId }, emileDB);
    }
    emileDB.close();
    return assetGroup;
}
