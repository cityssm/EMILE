import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { ensureEnergyDataTablesExists, refreshAggregatedEnergyDataTables, reloadEnergyDataTableNames } from './manageEnergyDataTables.js';
import { updateAssetTimeSeconds } from './updateAsset.js';
export async function deleteEnergyData(assetId, dataId, sessionUser) {
    const emileDB = await getConnectionWhenAvailable();
    const tableNames = await ensureEnergyDataTablesExists(assetId, emileDB);
    const result = emileDB
        .prepare(`update ${tableNames.raw}
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and dataId = ?`)
        .run(sessionUser.userName, Date.now(), dataId);
    await updateAssetTimeSeconds(assetId, emileDB);
    refreshAggregatedEnergyDataTables(assetId, emileDB);
    emileDB.close();
    clearCacheByTableName('EnergyData');
    return result.changes > 0;
}
export async function deleteEnergyDataByFileId(fileId, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable());
    const tableNames = await reloadEnergyDataTableNames(emileDB);
    let count = 0;
    for (const tableName of tableNames) {
        if (tableName.endsWith('_Daily') || tableName.endsWith('_Monthly')) {
            continue;
        }
        const result = emileDB
            .prepare(`update ${tableName}
          set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
          where recordDelete_timeMillis is null
          and fileId = ?`)
            .run(sessionUser.userName, Date.now(), fileId);
        if (result.changes > 0) {
            const assetId = tableName.slice(Math.max(0, tableName.lastIndexOf('_') + 1));
            await updateAssetTimeSeconds(assetId, emileDB);
            refreshAggregatedEnergyDataTables(assetId, emileDB);
            count += result.changes;
        }
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    clearCacheByTableName('EnergyData');
    return count > 0;
}
