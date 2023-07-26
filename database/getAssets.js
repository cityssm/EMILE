import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getAssets() {
    const emileDB = sqlite(databasePath);
    const assets = emileDB
        .prepare(`select a.assetId, a.assetName,
        a.categoryId, c.category, c.fontAwesomeIconClasses
        from Assets a
        left join AssetCategories c on a.categoryId = c.categoryId
        where a.recordDelete_timeMillis is null
        order by a.assetName, c.category`)
        .all();
    emileDB.close();
    return assets;
}
