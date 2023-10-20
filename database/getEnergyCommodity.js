import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getEnergyCommodityByGreenButtonId(commodityGreenButtonId, connectedEmileDB) {
    const emileDB = connectedEmileDB ??
        sqlite(databasePath, {
            readonly: true
        });
    const commodity = emileDB
        .prepare(`select commodityId, commodity, greenButtonId
        from EnergyCommodities
        where recordDelete_timeMillis is null
        and greenButtonId = ?`)
        .get(commodityGreenButtonId);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return commodity;
}
export function getEnergyCommodityByName(commodityName, connectedEmileDB) {
    const emileDB = connectedEmileDB ??
        sqlite(databasePath, {
            readonly: true
        });
    const commodity = emileDB
        .prepare(`select commodityId, commodity, greenButtonId
        from EnergyCommodities
        where recordDelete_timeMillis is null
        and commodity = ?`)
        .get(commodityName);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return commodity;
}
