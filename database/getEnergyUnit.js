import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getEnergyUnit(filterField, filterValue, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true));
    const unit = emileDB
        .prepare(`select unitId, unit, unitLong, greenButtonId
        from EnergyUnits
        where recordDelete_timeMillis is null
        and ${filterField} = ?`)
        .get(filterValue);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return unit;
}
