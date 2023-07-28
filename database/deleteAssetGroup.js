import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function deleteAssetGroup(groupId, sessionUser) {
    const emileDB = sqlite(databasePath);
    const result = emileDB
        .prepare(`update AssetGroups
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and groupId = ?`)
        .run(sessionUser.userName, Date.now(), groupId);
    emileDB.close();
    return result.changes > 0;
}
