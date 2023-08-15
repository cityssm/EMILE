import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getEnergyCommodityByGreenButtonId(commodityGreenButtonId, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
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
