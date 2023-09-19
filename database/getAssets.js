import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getAssets(filters, options, connectedEmileDB) {
    let sql = `select a.assetId, a.assetName, a.latitude, a.longitude,
    a.categoryId, c.category, c.fontAwesomeIconClasses
    ${options?.includeEnergyDataStats ?? false
        ? ', s.timeSecondsMin, s.endTimeSecondsMax'
        : ''}
    from Assets a
    left join AssetCategories c on a.categoryId = c.categoryId
    ${options?.includeEnergyDataStats ?? false
        ? ` left join (
              select assetId, min(timeSeconds) as timeSecondsMin,
              max(endTimeSeconds) as endTimeSecondsMax
              from EnergyData
              where recordDelete_timeMillis is null
              group by assetId) s on a.assetId = s.assetId`
        : ''}
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
    const emileDB = connectedEmileDB === undefined
        ? await getConnectionWhenAvailable(true)
        : connectedEmileDB;
    const assets = emileDB.prepare(sql).all(sqlParameters);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return assets;
}
