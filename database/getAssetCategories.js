import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getAssetCategories(connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, { readonly: true })
        : connectedEmileDB;
    const assetCategories = emileDB
        .prepare(`select categoryId, category, fontAwesomeIconClasses
        from AssetCategories
        where recordDelete_timeMillis is null
        order by orderNumber, category`)
        .all();
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return assetCategories;
}
