import type sqlite from 'better-sqlite3'

type RecordTable = 'AssetCategories'

const recordIdColumns = new Map<RecordTable, string>()
recordIdColumns.set('AssetCategories', 'categoryId')

export function updateRecordOrderNumber(
  recordTable: RecordTable,
  recordId: number | string,
  orderNumber: number | string,
  connectedEmileDB: sqlite.Database
): boolean {
  const result = connectedEmileDB
    .prepare(
      `update ${recordTable}
        set orderNumber = ?
        where recordDelete_timeMillis is null
        and ${recordIdColumns.get(recordTable) as string} = ?`
    )
    .run(orderNumber, recordId)

  return result.changes > 0
}
