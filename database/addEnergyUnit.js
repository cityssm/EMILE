import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function addEnergyUnit(unit, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB;
    const rightNowMillis = Date.now();
    const result = emileDB
        .prepare(`insert into EnergyUnits (
        unit, unitLong, greenButtonId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_millis)
        values (?, ?, ?, ?, ?, ?, ?)`)
        .run(unit.unit, unit.unitLong ?? unit.unit, unit.greenButtonId, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.lastInsertRowid;
}
