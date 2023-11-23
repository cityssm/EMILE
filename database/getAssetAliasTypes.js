import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getAssetAliasTypes() {
    const emileDB = await getConnectionWhenAvailable(true);
    const assetAliasTypes = emileDB
        .prepare(`select aliasTypeId, aliasType, regularExpression, aliasTypeKey
        from AssetAliasTypes
        where recordDelete_timeMillis is null
        order by orderNumber, aliasType`)
        .all();
    emileDB.close();
    return assetAliasTypes;
}
