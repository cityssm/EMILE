import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function updateEnergyDataFileAsFailed(energyDataFile, sessionUser) {
    const emileDB = sqlite(databasePath);
    const result = emileDB
        .prepare(`update EnergyDataFiles
        set isFailed = 1,
        processedTimeMillis = ?,
        processedMessage = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`)
        .run(energyDataFile.processedTimeMillis, energyDataFile.processedMessage, sessionUser.userName, Date.now(), energyDataFile.fileId);
    emileDB.close();
    return result.changes > 0;
}
