import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { databasePath } from '../helpers/functions.database.js';
export function deleteAssetCategory(categoryId, sessionUser) {
    const emileDB = sqlite(databasePath);
    const result = emileDB
        .prepare(`update AssetCategories
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and categoryId = ?`)
        .run(sessionUser.userName, Date.now(), categoryId);
    emileDB.close();
    clearCacheByTableName('AssetCategories');
    return result.changes > 0;
}
