import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getAssetGroups(sessionUser) {
    const emileDB = sqlite(databasePath, {
        readonly: true
    });
    const assetGroups = emileDB
        .prepare(`select g.groupId, g.groupName, g.groupDescription, g.isShared, g.recordCreate_userName,
        count(m.assetId) as groupMemberCount
        from AssetGroups g
        left join AssetGroupMembers m on g.groupId = m.groupId
          and m.recordDelete_timeMillis is null
        left join Assets a on m.assetId = a.assetId
          and a.recordDelete_timeMillis is null
        where g.recordDelete_timeMillis is null
          and (g.recordCreate_userName = ? or g.isShared = 1)
        group by g.groupId, g.groupName, g.groupDescription, g.isShared, g.recordCreate_userName
        order by g.groupName, g.groupId`)
        .all(sessionUser.userName);
    emileDB.close();
    return assetGroups;
}
