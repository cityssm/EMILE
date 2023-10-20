import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getEnergyServiceCategoryByGreenButtonId(serviceCategoryGreenButtonId, connectedEmileDB) {
    const emileDB = connectedEmileDB ??
        sqlite(databasePath, {
            readonly: true
        });
    const serviceCategory = emileDB
        .prepare(`select serviceCategoryId, serviceCategory, greenButtonId
        from EnergyServiceCategories
        where recordDelete_timeMillis is null
        and greenButtonId = ?`)
        .get(serviceCategoryGreenButtonId);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return serviceCategory;
}
export function getEnergyServiceCategoryByName(serviceCategoryName, connectedEmileDB) {
    const emileDB = connectedEmileDB ??
        sqlite(databasePath, {
            readonly: true
        });
    const serviceCategory = emileDB
        .prepare(`select serviceCategoryId, serviceCategory, greenButtonId
        from EnergyServiceCategories
        where recordDelete_timeMillis is null
        and serviceCategory = ?`)
        .get(serviceCategoryName);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return serviceCategory;
}
