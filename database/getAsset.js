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
export function getAssetByAssetAlias(assetAlias, aliasTypeId) {
    const emileDB = sqlite(databasePath, {
        readonly: true
    });
    let sql = `select assetId from AssetAliases
    where recordDelete_timeMillis is null
    and assetAlias = ?`;
    const sqlParameters = [assetAlias];
    if (aliasTypeId !== undefined) {
        sql += ' and aliasTypeId = ?';
        sqlParameters.push(aliasTypeId);
    }
    const asset = emileDB.prepare(sql).get(sqlParameters);
    if (asset !== undefined) {
        return getAsset(asset.assetId, emileDB);
    }
    return undefined;
}
