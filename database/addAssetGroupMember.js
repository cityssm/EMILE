import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function addAssetGroupMember(groupId, assetId, sessionUser) {
    const emileDB = sqlite(databasePath);
    const rightNowMillis = Date.now();
    let result = emileDB
        .prepare(`update AssetGroupMembers
        set recordDelete_userName = null,
        recordDelete_timeMillis = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where groupId = ?
        and assetId = ?`)
        .run(sessionUser.userName, rightNowMillis, groupId, assetId);
    if (result.changes === 0) {
        result = emileDB
            .prepare(`insert into AssetGroupMembers (
          groupId, assetId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?)`)
            .run(groupId, assetId, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis);
    }
    emileDB.close();
    return result.changes > 0;
}
