import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getEnergyUnitByGreenButtonId(unitGreenButtonId, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
    const unit = emileDB
        .prepare(`select unitId, unit, unitLong, greenButtonId
        from EnergyUnits
        where recordDelete_timeMillis is null
        and greenButtonId = ?`)
        .get(unitGreenButtonId);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return unit;
}
