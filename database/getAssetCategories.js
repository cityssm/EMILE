import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getAssetCategories() {
    const emileDB = sqlite(databasePath);
    const assetCategories = emileDB
        .prepare(`select categoryId, category, fontAwesomeIconClasses
        from AssetCategories
        where recordDelete_timeMillis is null
        order by category`)
        .all();
    emileDB.close();
    return assetCategories;
}
