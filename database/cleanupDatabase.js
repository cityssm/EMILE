import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
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
    `delete from EnergyData
    where recordDelete_timeMillis <= ?`,
    `delete from EnergyDataTypes
    where recordDelete_timeMillis <= ?
    and dataTypeId not in (select dataTypeId from EnergyData)`,
    `delete from Assets
    where recordDelete_timeMillis <= ?
    and assetId not in (select assetId from AssetGroupMembers)
    and assetId not in (select assetId from AssetAliases)
    and assetId not in (select assetId from EnergyDataFiles)`,
    `delete from AssetCategories
    where recordDelete_timeMillis <= ?
    and categoryId not in (select categoryId from Assets)`,
    `delete from Users
    where recordDelete_timeMillis <= ?`
];
export function cleanupDatabase(sessionUser) {
    const emileDB = sqlite(databasePath);
    const recordDeleteTimeMillis = Date.now() - deleteAgeDays * 86400 * 1000;
    let deleteCount = 0;
    for (const sql of deleteSql) {
        const result = emileDB.prepare(sql).run(recordDeleteTimeMillis);
        deleteCount += result.changes;
    }
    if (deleteCount > 0) {
        emileDB.prepare('vacuum').run();
    }
    emileDB.close();
    return deleteCount;
}
