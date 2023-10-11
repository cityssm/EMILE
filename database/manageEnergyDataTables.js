import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { recordColumns } from './initializeDatabase.js';
let energyDataTableNames = new Set();
export const energyDataTablePrefix = 'EnergyData_AssetId_';
function getEnergyDataTableName(assetId) {
    return `${energyDataTablePrefix}${assetId}`;
}
export async function reloadEnergyDataTableNames(connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? await getConnectionWhenAvailable()
        : connectedEmileDB;
    const result = emileDB
        .prepare(`select name from sqlite_master
        where type = 'table'
        and name like '${energyDataTablePrefix}%'`)
        .all();
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    const newEnergyDataTableNames = new Set();
    for (const tableName of result) {
        newEnergyDataTableNames.add(tableName.name);
    }
    energyDataTableNames = newEnergyDataTableNames;
    return energyDataTableNames;
}
export async function refreshEnergyDataTableView(connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? await getConnectionWhenAvailable()
        : connectedEmileDB;
    await reloadEnergyDataTableNames(emileDB);
    emileDB.prepare('drop view if exists EnergyData').run();
    let createViewSql = '';
    if (energyDataTableNames.size === 0) {
        createViewSql = `create view if not exists EnergyData as
      select 0 as dataId,
      0 as assetId,
      0 as dataTypeId,
      0 as fileId,
      0 as timeSeconds,
      0 as durationSeconds,
      0 as endTimeSeconds,
      0 as dataValue,
      0 as powerOfTenMultiplier,
      'system.init' as recordCreate_userName,
      0 as recordCreate_timeMillis,
      'system.init' as recordUpdate_userName,
      0 as recordUpdate_timeMillis,
      'system.init' as recordDelete_userName,
      0 as recordDelete_timeMillis
    `;
    }
    else {
        const selectStatements = [];
        for (const tableName of energyDataTableNames) {
            selectStatements.push(`select dataId, assetId, dataTypeId, fileId,
        timeSeconds, durationSeconds, endTimeSeconds,
        dataValue, powerOfTenMultiplier,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis,
        recordDelete_userName, recordDelete_timeMillis
        from ${tableName}
        where recordDelete_timeMillis is null`);
        }
        createViewSql = `create view if not exists EnergyData as
      ${selectStatements.join(' union ')}`;
    }
    emileDB.prepare(createViewSql).run();
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
}
export async function ensureEnergyDataTableExists(assetId, connectedEmileDB) {
    if (energyDataTableNames.size === 0) {
        await reloadEnergyDataTableNames(connectedEmileDB);
    }
    const tableName = getEnergyDataTableName(assetId);
    if (energyDataTableNames.has(tableName)) {
        return tableName;
    }
    const emileDB = connectedEmileDB === undefined
        ? await getConnectionWhenAvailable()
        : connectedEmileDB;
    emileDB
        .prepare(`create table if not exists ${tableName} (
        dataId integer primary key autoincrement,
        assetId integer not null references Assets (assetId) check (assetId = ${assetId}),
        dataTypeId integer not null references EnergyDataTypes (dataTypeId),
        fileId integer references EnergyDataFiles (fileId),
        timeSeconds integer not null check (timeSeconds > 0),
        durationSeconds integer not null check (durationSeconds > 0),
        endTimeSeconds integer not null generated always as (timeSeconds + durationSeconds) virtual,
        dataValue decimal(10, 2) not null,
        powerOfTenMultiplier integer not null default 0,
        ${recordColumns}
      )`)
        .run();
    emileDB
        .prepare(`create index if not exists idx_${tableName} on ${tableName}
        (timeSeconds, dataTypeId)
        where recordDelete_timeMillis is null`)
        .run();
    await refreshEnergyDataTableView(emileDB);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return tableName;
}
