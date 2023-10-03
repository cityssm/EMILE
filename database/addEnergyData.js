import Debug from 'debug';
import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { delay } from '../helpers/functions.utilities.js';
import { ensureEnergyDataTableExists } from './manageEnergyDataTables.js';
import { updateAssetTimeSeconds } from './updateAsset.js';
const debug = Debug('emile:database:addEnergyData');
export async function addEnergyData(data, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? await getConnectionWhenAvailable()
        : connectedEmileDB;
    let result;
    while (true) {
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
            debug('Waiting 1 second ...');
            await delay(1000);
        }
    }
    await updateAssetTimeSeconds(data.assetId, emileDB);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    clearCacheByTableName('EnergyData');
    return result.lastInsertRowid;
}
