import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { getEnergyDataTableNames, refreshEnergyDataTableViews, reloadEnergyDataTableNames } from './manageEnergyDataTables.js';
const deleteAgeDays = 14;
const deleteSql = [
    `delete from AssetAliases
    where recordDelete_timeMillis <= ?`,
    `delete from AssetAliasTypes
    where recordDelete_timeMillis <= ?
    and aliasTypeId not in (select aliasTypeId from AssetAliases)`,
    `delete from AssetGroupMembers
    where recordDelete_timeMillis <= ?`,
    `delete from AssetGroupMembers
    where groupId in (select groupId from AssetGroups where recordDelete_timeMillis <= ?)`,
    `delete from AssetGroupMembers
    where assetId in (select assetId from Assets where recordDelete_timeMillis <= ?)`,
    `delete from AssetGroups
    where recordDelete_timeMillis <= ?
    and groupId not in (select groupId from AssetGroupMembers)`,
    `delete from Assets
    where recordDelete_timeMillis <= ?
    and assetId not in (select assetId from AssetGroupMembers)
    and assetId not in (select assetId from AssetAliases)
    and assetId not in (select assetId from EnergyDataFiles)
    and assetId not in (select assetId from EnergyData)`,
    `delete from AssetCategories
    where recordDelete_timeMillis <= ?
    and categoryId not in (select categoryId from Assets)`,
    `delete from Users
    where recordDelete_timeMillis <= ?`
];
const postEnergyDataDeleteSql = [
    `delete from EnergyDataTypes
    where recordDelete_timeMillis <= ?
    and dataTypeId not in (select dataTypeId from EnergyData)`,
    `delete from EnergyDataFiles
    where recordDelete_timeMillis <= ?
    and fileId not in (select fileId from EnergyData)`
];
export async function cleanupDatabase() {
    let deleteCount = 0;
    let dropCount = 0;
    const recordDeleteTimeMillis = Date.now() - deleteAgeDays * 86400 * 1000;
    const emileDB = await getConnectionWhenAvailable();
    try {
        for (const sql of deleteSql) {
            const result = emileDB.prepare(sql).run(recordDeleteTimeMillis);
            deleteCount += result.changes;
        }
        const assets = emileDB
            .prepare('select assetId from Assets')
            .all();
        const energyDataTableNames = await reloadEnergyDataTableNames(emileDB);
        for (const tableName of energyDataTableNames) {
            const assetExists = assets.some((possibleAsset) => {
                const assetTableNames = getEnergyDataTableNames(possibleAsset.assetId);
                return Object.values(assetTableNames).includes(tableName);
            });
            if (!assetExists) {
                emileDB.prepare(`drop table if exists ${tableName}`).run();
                dropCount += 1;
                await refreshEnergyDataTableViews(emileDB);
            }
            else if (!tableName.endsWith('_Daily') &&
                !tableName.endsWith('_Monthly')) {
                const result = emileDB
                    .prepare(`delete from ${tableName} where recordDelete_timeMillis <= ?`)
                    .run(recordDeleteTimeMillis);
                deleteCount += result.changes;
            }
        }
        for (const sql of postEnergyDataDeleteSql) {
            const result = emileDB.prepare(sql).run(recordDeleteTimeMillis);
            deleteCount += result.changes;
        }
        if (deleteCount > 0 || dropCount > 0) {
            emileDB.prepare('vacuum').run();
        }
    }
    catch {
    }
    finally {
        emileDB.close();
    }
    return deleteCount;
}
