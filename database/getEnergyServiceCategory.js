import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getEnergyServiceCategoryByGreenButtonId(serviceCategoryGreenButtonId, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
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
