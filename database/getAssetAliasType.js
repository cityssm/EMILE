import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getAssetAliasTypeByAliasTypeKey(aliasTypeKey) {
    try {
        const emileDB = sqlite(databasePath, {
            readonly: true
        });
        const assetAliasType = emileDB
            .prepare(`select aliasTypeId, aliasType, regularExpression, aliasTypeKey
          from AssetAliasTypes
          where recordDelete_timeMillis is null
          and aliasTypeKey = ?`)
            .get(aliasTypeKey);
        emileDB.close();
        return assetAliasType;
    }
    catch {
        return undefined;
    }
}
