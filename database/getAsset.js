import NodeCache from 'node-cache';
import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { getAssetAliases } from './getAssetAliases.js';
export async function getAsset(assetId, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true));
    const asset = emileDB
        .prepare(`select a.assetId, a.assetName, a.latitude, a.longitude,
        a.categoryId, c.category, c.fontAwesomeIconClasses
        from Assets a
        left join AssetCategories c on a.categoryId = c.categoryId
        where a.recordDelete_timeMillis is null
        and a.assetId = ?`)
        .get(assetId);
    if (asset !== undefined) {
        asset.assetAliases = await getAssetAliases({
            assetId: asset.assetId
        }, emileDB);
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return asset;
}
const assetAliasCache = new NodeCache({
    stdTTL: 30
});
function getAssetAliasCacheKey(assetAlias, aliasTypeId) {
    return `${aliasTypeId ?? ''}::::${assetAlias}`;
}
export async function getAssetByAssetAlias(assetAlias, aliasTypeId, connectedEmileDB) {
    const assetAliasCacheKey = getAssetAliasCacheKey(assetAlias, aliasTypeId);
    let asset = assetAliasCache.get(assetAliasCacheKey);
    if (asset !== undefined) {
        return asset;
    }
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable());
    let sql = `select assetId from AssetAliases
    where recordDelete_timeMillis is null
    and assetId in (select assetId from Assets where recordDelete_timeMillis is null)
    and assetAlias = ?`;
    const sqlParameters = [assetAlias];
    if (aliasTypeId !== undefined) {
        sql += ' and aliasTypeId = ?';
        sqlParameters.push(aliasTypeId);
    }
    const assetId = emileDB.prepare(sql).pluck().get(sqlParameters);
    if (assetId !== undefined) {
        asset = await getAsset(assetId, emileDB);
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    assetAliasCache.set(assetAliasCacheKey, asset);
    return asset;
}
