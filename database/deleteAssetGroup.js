import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
import { deleteAssetGroupMembersByGroupId } from './deleteAssetGroupMember.js';
export function deleteAssetGroup(groupId, sessionUser) {
    const emileDB = sqlite(databasePath);
    const result = emileDB
        .prepare(`update AssetGroups
    set recordDelete_userName = ?,
    recordDelete_timeMillis = ?
    where recordDelete_timeMillis is null
    and groupId = ?`)
        .run(sessionUser.userName, Date.now(), groupId);
    if (result.changes > 0) {
        deleteAssetGroupMembersByGroupId(groupId, sessionUser, emileDB);
    }
    emileDB.close();
    return result.changes > 0;
}
