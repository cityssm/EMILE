import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { databasePath, getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
const recordIdColumns = new Map();
recordIdColumns.set('AssetCategories', 'categoryId');
function getCurrentOrderNumber(recordTable, recordId, database) {
    const currentOrderNumber = database
        .prepare(`select orderNumber
          from ${recordTable}
          where ${recordIdColumns.get(recordTable)} = ?`)
        .get(recordId).orderNumber;
    return currentOrderNumber;
}
export async function moveRecordDown(recordTable, recordId) {
    const emileDB = await getConnectionWhenAvailable();
    const currentOrderNumber = getCurrentOrderNumber(recordTable, recordId, emileDB);
    emileDB
        .prepare(`update ${recordTable}
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
        and orderNumber = ? + 1`)
        .run(currentOrderNumber);
    const success = updateRecordOrderNumber(recordTable, recordId, currentOrderNumber + 1, emileDB);
    emileDB.close();
    clearCacheByTableName(recordTable);
    return success;
}
export async function moveRecordDownToBottom(recordTable, recordId) {
    const emileDB = await getConnectionWhenAvailable();
    const currentOrderNumber = getCurrentOrderNumber(recordTable, recordId, emileDB);
    const maxOrderNumber = emileDB
        .prepare(`select max(orderNumber) as maxOrderNumber
        from ${recordTable}
        where recordDelete_timeMillis is null`)
        .get().maxOrderNumber;
    if (currentOrderNumber !== maxOrderNumber) {
        updateRecordOrderNumber(recordTable, recordId, maxOrderNumber + 1, emileDB);
        emileDB
            .prepare(`update ${recordTable}
          set orderNumber = orderNumber - 1
          where recordDelete_timeMillis is null
          and orderNumber > ?`)
            .run(currentOrderNumber);
    }
    emileDB.close();
    clearCacheByTableName(recordTable);
    return true;
}
export async function moveRecordUp(recordTable, recordId) {
    const emileDB = sqlite(databasePath);
    const currentOrderNumber = getCurrentOrderNumber(recordTable, recordId, emileDB);
    if (currentOrderNumber <= 0) {
        emileDB.close();
        return true;
    }
    emileDB
        .prepare(`update ${recordTable}
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
        and orderNumber = ? - 1`)
        .run(currentOrderNumber);
    const success = updateRecordOrderNumber(recordTable, recordId, currentOrderNumber - 1, emileDB);
    emileDB.close();
    clearCacheByTableName(recordTable);
    return success;
}
export async function moveRecordUpToTop(recordTable, recordId) {
    const emileDB = await getConnectionWhenAvailable();
    const currentOrderNumber = getCurrentOrderNumber(recordTable, recordId, emileDB);
    if (currentOrderNumber > 0) {
        updateRecordOrderNumber(recordTable, recordId, -1, emileDB);
        emileDB
            .prepare(`update ${recordTable}
          set orderNumber = orderNumber + 1
          where recordDelete_timeMillis is null
          and orderNumber < ?`)
            .run(currentOrderNumber);
    }
    emileDB.close();
    clearCacheByTableName(recordTable);
    return true;
}
