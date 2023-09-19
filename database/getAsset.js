import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
import { getAssetAliases } from './getAssetAliases.js';
export function getAsset(assetId, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
    const asset = emileDB
        .prepare(`select a.assetId, a.assetName, a.latitude, a.longitude,
        a.categoryId, c.category, c.fontAwesomeIconClasses
        from Assets a
        left join AssetCategories c on a.categoryId = c.categoryId
        where a.recordDelete_timeMillis is null
        and a.assetId = ?`)
        .get(assetId);
    if (asset !== undefined) {
        asset.assetAliases = getAssetAliases({
            assetId: asset.assetId
        }, emileDB);
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return asset;
}
export function getAssetByAssetAlias(assetAlias, aliasTypeId, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
    let sql = `select assetId from AssetAliases
    where recordDelete_timeMillis is null
    and assetId in (select assetId from Assets where recordDelete_timeMillis is null)
    and assetAlias = ?`;
    const sqlParameters = [assetAlias];
    if (aliasTypeId !== undefined) {
        sql += ' and aliasTypeId = ?';
        sqlParameters.push(aliasTypeId);
    }
    let asset;
    const assetId = emileDB.prepare(sql).get(sqlParameters);
    if (assetId !== undefined) {
        asset = getAsset(assetId.assetId, emileDB);
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return asset;
}
