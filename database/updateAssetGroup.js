import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function updateAssetGroup(group, sessionUser) {
    const emileDB = sqlite(databasePath);
    const result = emileDB
        .prepare(`update AssetGroups
        set groupName = ?,
        groupDescription = ?,
        isShared = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and groupId = ?`)
        .run(group.groupName, group.groupDescription, group.isShared, sessionUser.userName, Date.now(), group.groupId);
    emileDB.close();
    return result.changes > 0;
}
