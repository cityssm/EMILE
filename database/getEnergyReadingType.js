import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getEnergyReadingTypeByGreenButtonId(readingTypeGreenButtonId, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
    const readingType = emileDB
        .prepare(`select readingTypeId, readingType, greenButtonId
        from EnergyReadingTypes
        where recordDelete_timeMillis is null
        and greenButtonId = ?`)
        .get(readingTypeGreenButtonId);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return readingType;
}
export function getEnergyReadingTypeByName(readingTypeName, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
    const readingType = emileDB
        .prepare(`select readingTypeId, readingType, greenButtonId
        from EnergyReadingTypes
        where recordDelete_timeMillis is null
        and readingType = ?`)
        .get(readingTypeName);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return readingType;
}
