import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getEnergyCommodity(filterField, filterValue, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true));
    const commodity = emileDB
        .prepare(`select commodityId, commodity, greenButtonId
        from EnergyCommodities
        where recordDelete_timeMillis is null
        and ${filterField} = ?`)
        .get(filterValue);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return commodity;
}
