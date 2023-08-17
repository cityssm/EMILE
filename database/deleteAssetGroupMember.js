import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function deleteAssetGroupMember(groupId, assetId, sessionUser) {
    const emileDB = sqlite(databasePath);
    const result = emileDB
        .prepare(`update AssetGroupMembers
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and groupId = ?
        and assetId = ?`)
        .run(sessionUser.userName, Date.now(), groupId, assetId);
    emileDB.close();
    return result.changes > 0;
}
