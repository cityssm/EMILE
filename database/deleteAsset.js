import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
import { deleteAssetAliasesByAssetId } from './deleteAssetAlias.js';
import { deleteAssetGroupMembersByAssetId } from './deleteAssetGroupMember.js';
export function deleteAsset(assetId, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB;
    const result = emileDB
        .prepare(`update Assets
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and assetId = ?`)
        .run(sessionUser.userName, Date.now(), assetId);
    if (result.changes > 0) {
        deleteAssetAliasesByAssetId(assetId, sessionUser, emileDB);
        deleteAssetGroupMembersByAssetId(assetId, sessionUser, emileDB);
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.changes > 0;
}
