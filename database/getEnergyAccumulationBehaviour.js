import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getEnergyAccumulationBehaviour(filterField, filterValue, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true));
    const accumulationBehaviour = emileDB
        .prepare(`select accumulationBehaviourId, accumulationBehaviour, greenButtonId
        from EnergyAccumulationBehaviours
        where recordDelete_timeMillis is null
        and ${filterField} = ?`)
        .get(filterValue);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return accumulationBehaviour;
}
