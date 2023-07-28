import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getAssets(filters = {}, connectedEmileDB) {
    let sql = `select a.assetId, a.assetName, a.latitude, a.longitude,
    a.categoryId, c.category, c.fontAwesomeIconClasses
    from Assets a
    left join AssetCategories c on a.categoryId = c.categoryId
    where a.recordDelete_timeMillis is null`;
    const sqlParameters = [];
    if ((filters.groupId ?? '') !== '') {
        sql += ` and a.assetId in (
          select g.assetId from AssetGroupMembers g
          where g.recordDelete_timeMillis is null
          and g.groupId = ?
        )`;
        sqlParameters.push(filters.groupId);
    }
    sql += ' order by c.orderNumber, c.category, a.assetName';
    const emileDB = sqlite(databasePath);
    const assets = emileDB.prepare(sql).all(sqlParameters);
    emileDB.close();
    return assets;
}
