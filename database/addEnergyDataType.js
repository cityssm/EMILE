import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function addEnergyDataType(energyDataType, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable());
    const rightNowMillis = Date.now();
    const result = emileDB
        .prepare(`insert into EnergyDataTypes (
        serviceCategoryId, unitId, readingTypeId, commodityId, accumulationBehaviourId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(energyDataType.serviceCategoryId, energyDataType.unitId, energyDataType.readingTypeId, energyDataType.commodityId, energyDataType.accumulationBehaviourId, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.lastInsertRowid;
}
