import { getConnectionWhenAvailable, getTempTableName } from '../helpers/functions.database.js';
export async function getAssets(filters, connectedEmileDB) {
    let sql = `select a.assetId, a.assetName, a.latitude, a.longitude,
    a.categoryId, c.category, c.fontAwesomeIconClasses, c.orderNumber,
    a.timeSecondsMin, a.endTimeSecondsMax
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
    const orderBy = ' order by orderNumber, category, assetName';
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true));
    const tempTableName = getTempTableName();
    emileDB
        .prepare(`create temp table ${tempTableName} as ${sql}`)
        .run(sqlParameters);
    const assets = emileDB
        .prepare(`select * from ${tempTableName} ${orderBy}`)
        .all();
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return assets;
}
