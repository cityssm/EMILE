import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function addEnergyReadingType(readingType, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable());
    const rightNowMillis = Date.now();
    const result = emileDB
        .prepare(`insert into EnergyReadingTypes (
        readingType, greenButtonId, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`)
        .run(readingType.readingType, readingType.greenButtonId, readingType.orderNumber ?? 0, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.lastInsertRowid;
}
