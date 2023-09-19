import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function updateEnergyDataValue(data, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB;
    const rightNowMillis = Date.now();
    const result = emileDB
        .prepare(`update EnergyData
        set fileId = ?,
        dataValue = ?,
        powerOfTenMultiplier = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where dataId = ?`)
        .run(data.fileId, data.dataValue, data.powerOfTenMultiplier ?? 0, sessionUser.userName, rightNowMillis, data.dataId);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.changes > 0;
}
