import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function deleteEnergyDataFile(fileId, sessionUser) {
    const emileDB = sqlite(databasePath);
    const result = emileDB
        .prepare(`update EnergyDataFiles
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`)
        .run(sessionUser.userName, Date.now(), fileId);
    emileDB.close();
    return result.changes > 0;
}
