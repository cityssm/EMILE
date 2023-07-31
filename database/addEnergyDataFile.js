import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function addEnergyDataFile(dataFile, sessionUser) {
    const emileDB = sqlite(databasePath);
    const rightNowMillis = Date.now();
    const parserPropertiesJson = dataFile.parserPropertiesJson ??
        JSON.stringify(dataFile.parserProperties ?? {});
    const result = emileDB
        .prepare(`insert into EnergyDataFiles (
        originalFileName, systemFileName, systemFolderPath,
        assetId, parserPropertiesJson, isPending,
        processedTimeMillis, isFailed, processedMessage,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(dataFile.originalFileName, dataFile.systemFileName, dataFile.systemFolderPath, dataFile.assetId, parserPropertiesJson, dataFile.isPending ? 1 : 0, dataFile.processedTimeMillis, dataFile.isFailed ? 1 : 0, dataFile.processedMessage, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis);
    emileDB.close();
    return result.lastInsertRowid;
}
