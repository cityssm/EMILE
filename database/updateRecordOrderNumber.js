const recordIdColumns = new Map();
recordIdColumns.set('AssetCategories', 'categoryId');
export function updateRecordOrderNumber(recordTable, recordId, orderNumber, connectedEmileDB) {
    const result = connectedEmileDB
        .prepare(`update ${recordTable}
        set orderNumber = ?
        where recordDelete_timeMillis is null
        and ${recordIdColumns.get(recordTable)} = ?`)
        .run(orderNumber, recordId);
    return result.changes > 0;
}
