import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getAssetAliasTypeByAliasTypeKey(aliasTypeKey, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true));
    try {
        const assetAliasType = emileDB
            .prepare(`select aliasTypeId, aliasType, regularExpression, aliasTypeKey
          from AssetAliasTypes
          where recordDelete_timeMillis is null
          and aliasTypeKey = ?`)
            .get(aliasTypeKey);
        return assetAliasType;
    }
    catch {
        return undefined;
    }
    finally {
        if (connectedEmileDB === undefined) {
            emileDB.close();
        }
    }
}
