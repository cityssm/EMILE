import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function addEnergyAccumulationBehaviour(accumulationBehaviour, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? await getConnectionWhenAvailable();
    const rightNowMillis = Date.now();
    const result = emileDB
        .prepare(`insert into EnergyAccumulationBehaviours (
        accumulationBehaviour, greenButtonId, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`)
        .run(accumulationBehaviour.accumulationBehaviour, accumulationBehaviour.greenButtonId, accumulationBehaviour.orderNumber ?? 0, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.lastInsertRowid;
}
