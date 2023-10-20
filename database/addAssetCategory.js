import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { databasePath } from '../helpers/functions.database.js';
export function addAssetCategory(category, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? sqlite(databasePath);
    const rightNowMillis = Date.now();
    const result = emileDB
        .prepare(`insert into AssetCategories (
        category, fontAwesomeIconClasses, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`)
        .run(category.category, category.fontAwesomeIconClasses ?? 'fas fa-bolt', category.orderNumber ?? -1, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    clearCacheByTableName('AssetCategories');
    return result.lastInsertRowid;
}
