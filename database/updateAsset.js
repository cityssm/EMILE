import sqlite from 'better-sqlite3';
import { databasePath, getConnectionWhenAvailable, getTempTableName, queryMaxRetryCount } from '../helpers/functions.database.js';
import { delay } from '../helpers/functions.utilities.js';
import { getAssets } from './getAssets.js';
import { ensureEnergyDataTableExists } from './manageEnergyDataTables.js';
export function updateAsset(asset, sessionUser) {
    const emileDB = sqlite(databasePath);
    const result = emileDB
        .prepare(`update Assets
        set assetName = ?,
        categoryId = ?,
        latitude = ?,
        longitude = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and assetId = ?`)
        .run(asset.assetName, asset.categoryId, (asset.latitude ?? '') === '' ? undefined : asset.latitude, (asset.longitude ?? '') === '' ? undefined : asset.longitude, sessionUser.userName, Date.now(), asset.assetId);
    emileDB.close();
    return result.changes > 0;
}
export async function updateAssetTimeSeconds(assetId, connectedEmileDB) {
    const tempTableName = getTempTableName();
    const tableName = await ensureEnergyDataTableExists(assetId);
    const emileDB = connectedEmileDB === undefined
        ? await getConnectionWhenAvailable()
        : connectedEmileDB;
    emileDB
        .prepare(`create temp table ${tempTableName} as 
        select min(timeSeconds) as timeSecondsMin,
        max(endTimeSeconds) as endTimeSecondsMax
        from ${tableName}
        where recordDelete_timeMillis is null`)
        .run();
    const result = emileDB.prepare(`select * from ${tempTableName}`).get();
    for (let retries = 0; retries <= queryMaxRetryCount; retries += 1) {
        try {
            emileDB
                .prepare(`update Assets
            set timeSecondsMin = ?,
            endTimeSecondsMax = ?
            where assetId = ?`)
                .run(result?.timeSecondsMin ?? undefined, result?.endTimeSecondsMax ?? undefined, assetId);
            break;
        }
        catch {
            await delay(500, 'updateAssetTimeSeconds');
        }
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return true;
}
export async function updateAllAssetTimeSeconds() {
    const emileDB = await getConnectionWhenAvailable();
    const assets = await getAssets({}, emileDB);
    for (const asset of assets) {
        await updateAssetTimeSeconds(asset.assetId, emileDB);
    }
    emileDB.close();
}
