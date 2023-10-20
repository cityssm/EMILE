import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function addAssetAlias(assetAlias, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? sqlite(databasePath);
    const rightNowMillis = Date.now();
    const result = emileDB
        .prepare(`insert into AssetAliases (
        assetId, aliasTypeId, assetAlias,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`)
        .run(assetAlias.assetId, assetAlias.aliasTypeId, assetAlias.assetAlias, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.lastInsertRowid;
}
