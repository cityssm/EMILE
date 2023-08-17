import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
function getEnergyDataFiles(filters, options) {
    const groupByColumnNames = `f.fileId, f.originalFileName,
    ${options.includeSystemFileAndFolder
        ? ' f.systemFileName, f.systemFolderPath,'
        : ''}
    f.assetId,
    ${options.includeAssetDetails
        ? ' a.assetName, c.category, c.fontAwesomeIconClasses,'
        : ''}
    isPending, parserPropertiesJson,
    processedTimeMillis, isFailed, processedMessage,
    f.recordCreate_timeMillis, f.recordUpdate_timeMillis`;
    let sql = `select ${groupByColumnNames},
    count(d.dataId) as energyDataCount
    from EnergyDataFiles f
    left join Assets a on f.assetId = a.assetId
    left join AssetCategories c on a.categoryId = c.categoryId
    left join EnergyData d on f.fileId = d.fileId and d.recordDelete_timeMillis is null
    where f.recordDelete_timeMillis is null`;
    const sqlParameters = [];
    if ((filters.isPending ?? '') !== '') {
        sql += ' and f.isPending = ?';
        sqlParameters.push(filters.isPending ? 1 : 0);
    }
    if ((filters.isProcessed ?? '') !== '') {
        sql += filters.isProcessed
            ? ' and f.processedTimeMillis is not null'
            : ' and f.processedTimeMillis is null';
    }
    if ((filters.isFailed ?? '') !== '') {
        sql += ' and f.isFailed = ?';
        sqlParameters.push(filters.isFailed ? 1 : 0);
    }
    if ((filters.searchString ?? '') !== '') {
        sql += ' and (instr(f.originalFileName, ?) > 0)';
        sqlParameters.push(filters.searchString);
    }
    sql += ` group by ${groupByColumnNames}
    order by f.recordUpdate_timeMillis desc`;
    if (options.limit !== -1) {
        sql += ` limit ${options.limit}`;
    }
    const emileDB = sqlite(databasePath, {
        readonly: true
    });
    const dataFiles = emileDB.prepare(sql).all(sqlParameters);
    emileDB.close();
    for (const dataFile of dataFiles) {
        if (dataFile.parserPropertiesJson !== undefined &&
            dataFile.parserPropertiesJson !== null) {
            dataFile.parserProperties = JSON.parse(dataFile.parserPropertiesJson);
        }
        delete dataFile.parserPropertiesJson;
    }
    return dataFiles;
}
export function getPendingEnergyDataFiles() {
    return getEnergyDataFiles({
        isPending: true
    }, {
        includeAssetDetails: true,
        includeSystemFileAndFolder: false,
        limit: -1
    });
}
export function getFailedEnergyDataFiles() {
    return getEnergyDataFiles({
        isFailed: true
    }, {
        includeAssetDetails: true,
        includeSystemFileAndFolder: false,
        limit: -1
    });
}
export function getProcessedEnergyDataFiles(searchString) {
    return getEnergyDataFiles({
        isProcessed: true,
        searchString
    }, {
        includeAssetDetails: true,
        includeSystemFileAndFolder: false,
        limit: 100
    });
}
export function getEnergyDataFilesToProcess() {
    return getEnergyDataFiles({
        isPending: false,
        isProcessed: false
    }, {
        includeAssetDetails: false,
        includeSystemFileAndFolder: true,
        limit: -1
    });
}
