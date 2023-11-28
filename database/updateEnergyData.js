import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { ensureEnergyDataTablesExists, refreshAggregatedEnergyDataTables } from './manageEnergyDataTables.js';
export async function updateEnergyDataValue(data, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable());
    const tableNames = await ensureEnergyDataTablesExists(data.assetId);
    const rightNowMillis = Date.now();
    const result = emileDB
        .prepare(`update ${tableNames.raw}
        set fileId = ?,
        dataValue = ?,
        powerOfTenMultiplier = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where dataId = ?
        and assetId = ?`)
        .run(data.fileId, data.dataValue, data.powerOfTenMultiplier ?? 0, sessionUser.userName, rightNowMillis, data.dataId, data.assetId);
    refreshAggregatedEnergyDataTables(data.assetId, emileDB);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    clearCacheByTableName('EnergyData');
    return result.changes > 0;
}
