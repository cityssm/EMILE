import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function updateEnergyDataFileAsFailed(energyDataFile, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable());
    const result = emileDB
        .prepare(`update EnergyDataFiles
        set isFailed = 1,
        processedTimeMillis = ?,
        processedMessage = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`)
        .run(energyDataFile.processedTimeMillis, energyDataFile.processedMessage, sessionUser.userName, Date.now(), energyDataFile.fileId);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.changes > 0;
}
export async function updatePendingEnergyDataFile(energyDataFile, sessionUser) {
    let parserClass = energyDataFile.parserClass;
    let parserConfig = '';
    if (parserClass.includes('::')) {
        parserConfig = parserClass.slice(Math.max(0, parserClass.indexOf('::') + 2));
        parserClass = parserClass.slice(0, Math.max(0, parserClass.indexOf('::')));
    }
    const parserPropertiesJson = energyDataFile.parserClass === ''
        ? '{}'
        : JSON.stringify({
            parserClass,
            parserConfig
        });
    const emileDB = await getConnectionWhenAvailable();
    const result = emileDB
        .prepare(`update EnergyDataFiles
        set assetId = ?,
        parserPropertiesJson = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`)
        .run(energyDataFile.assetId === '' ? undefined : energyDataFile.assetId, parserPropertiesJson, sessionUser.userName, Date.now(), energyDataFile.fileId);
    emileDB.close();
    return result.changes > 0;
}
export async function updateEnergyDataFileAsReadyToPending(fileId, sessionUser) {
    const emileDB = await getConnectionWhenAvailable();
    const result = emileDB
        .prepare(`update EnergyDataFiles
        set isPending = 1,
        isFailed = 0,
        processedTimeMillis = null,
        processedMessage = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`)
        .run(sessionUser.userName, Date.now(), fileId);
    emileDB.close();
    return result.changes > 0;
}
export async function updateEnergyDataFileAsReadyToProcess(fileId, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable());
    const result = emileDB
        .prepare(`update EnergyDataFiles
        set isPending = 0,
        isFailed = 0,
        processedTimeMillis = null,
        processedMessage = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`)
        .run(sessionUser.userName, Date.now(), fileId);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.changes > 0;
}
export async function updateEnergyDataFileAsProcessed(fileId, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable());
    const rightNow = Date.now();
    const result = emileDB
        .prepare(`update EnergyDataFiles
        set processedTimeMillis = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`)
        .run(rightNow, sessionUser.userName, Date.now(), fileId);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.changes > 0;
}
