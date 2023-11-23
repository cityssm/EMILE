import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getEnergyReadingType(filterField, filterValue, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true));
    const readingType = emileDB
        .prepare(`select readingTypeId, readingType, greenButtonId
        from EnergyReadingTypes
        where recordDelete_timeMillis is null
        and ${filterField} = ?`)
        .get(filterValue);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return readingType;
}
