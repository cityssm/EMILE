import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getEnergyAccumulationBehaviourByGreenButtonId(accumulationBehaviourGreenButtonId, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
    const accumulationBehaviour = emileDB
        .prepare(`select accumulationBehaviourId, accumulationBehaviour, greenButtonId
        from EnergyAccumulationBehaviours
        where recordDelete_timeMillis is null
        and greenButtonId = ?`)
        .get(accumulationBehaviourGreenButtonId);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return accumulationBehaviour;
}
export function getEnergyAccumulationBehaviourByName(accumulationBehaviourName, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
    const accumulationBehaviour = emileDB
        .prepare(`select accumulationBehaviourId, accumulationBehaviour, greenButtonId
        from EnergyAccumulationBehaviours
        where recordDelete_timeMillis is null
        and accumulationBehaviour = ?`)
        .get(accumulationBehaviourName);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return accumulationBehaviour;
}
