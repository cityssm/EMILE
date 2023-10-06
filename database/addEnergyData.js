import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { getConnectionWhenAvailable, queryMaxRetryCount } from '../helpers/functions.database.js';
import { delay } from '../helpers/functions.utilities.js';
import { ensureEnergyDataTableExists } from './manageEnergyDataTables.js';
import { updateAssetTimeSeconds } from './updateAsset.js';
export async function addEnergyData(data, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? await getConnectionWhenAvailable()
        : connectedEmileDB;
    let result;
    for (let count = 0; count <= queryMaxRetryCount; count += 1) {
        try {
            const rightNowMillis = Date.now();
            const tableName = await ensureEnergyDataTableExists(data.assetId);
            result = emileDB
                .prepare(`insert into ${tableName} (
            assetId, dataTypeId, fileId,
            timeSeconds, durationSeconds, dataValue, powerOfTenMultiplier,
            recordCreate_userName, recordCreate_timeMillis,
            recordUpdate_userName, recordUpdate_timeMillis)
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                .run(data.assetId, data.dataTypeId, data.fileId, data.timeSeconds, data.durationSeconds, data.dataValue, data.powerOfTenMultiplier ?? 0, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis);
            break;
        }
        catch {
            await delay(500, 'addEnergyData');
        }
    }
    if (result === undefined) {
        throw new Error(`Database still locked after ${queryMaxRetryCount} retries.`);
    }
    else {
        await updateAssetTimeSeconds(data.assetId, emileDB);
        if (connectedEmileDB === undefined) {
            emileDB.close();
        }
        clearCacheByTableName('EnergyData');
        return result.lastInsertRowid;
    }
}
