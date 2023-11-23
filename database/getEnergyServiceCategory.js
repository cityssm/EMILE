import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getEnergyServiceCategory(filterField, filterValue, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true));
    const serviceCategory = emileDB
        .prepare(`select serviceCategoryId, serviceCategory, greenButtonId
        from EnergyServiceCategories
        where recordDelete_timeMillis is null
        and ${filterField} = ?`)
        .get(filterValue);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return serviceCategory;
}
