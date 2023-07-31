import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getAssetAliases(filters, connectedEmileDB) {
    let sql = `select a.aliasId, a.assetId, a.assetAlias,
    a.aliasTypeId, t.aliasType
    from AssetAliases a
    left join AssetAliasTypes t on a.aliasTypeId = t.aliasTypeId
    where a.recordDelete_timeMillis is null`;
    const sqlParameters = [];
    if ((filters.assetId ?? '') !== '') {
        sql += ' and a.assetId = ?';
        sqlParameters.push(filters.assetId ?? '');
    }
    sql += ' order by t.orderNumber, t.aliasType, a.assetId, a.assetAlias';
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
    const assetAliases = emileDB.prepare(sql).all(sqlParameters);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return assetAliases;
}
