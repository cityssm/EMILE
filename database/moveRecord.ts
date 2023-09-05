import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/functions.cache.js'
import { databasePath } from '../helpers/functions.database.js'

import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

type RecordTable = 'AssetCategories'

const recordIdColumns = new Map<RecordTable, string>()
recordIdColumns.set('AssetCategories', 'categoryId')

function getCurrentOrderNumber(
  recordTable: RecordTable,
  recordId: number | string,
  database: sqlite.Database
): number {
  const currentOrderNumber: number = (
    database
      .prepare(
        `select orderNumber
          from ${recordTable}
          where ${recordIdColumns.get(recordTable) as string} = ?`
      )
      .get(recordId) as { orderNumber: number }
  ).orderNumber

  return currentOrderNumber
}

export function moveRecordDown(
  recordTable: RecordTable,
  recordId: number
): boolean {
  const emileDB = sqlite(databasePath)

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    emileDB
  )

  emileDB
    .prepare(
      `update ${recordTable}
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
        and orderNumber = ? + 1`
    )
    .run(currentOrderNumber)

  const success = updateRecordOrderNumber(
    recordTable,
    recordId,
    currentOrderNumber + 1,
    emileDB
  )

  emileDB.close()

  clearCacheByTableName(recordTable)

  return success
}

export function moveRecordDownToBottom(
  recordTable: RecordTable,
  recordId: number
): boolean {
  const emileDB = sqlite(databasePath)

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    emileDB
  )

  const maxOrderNumber = (
    emileDB
      .prepare(
        `select max(orderNumber) as maxOrderNumber
        from ${recordTable}
        where recordDelete_timeMillis is null`
      )
      .get() as { maxOrderNumber: number }
  ).maxOrderNumber

  if (currentOrderNumber !== maxOrderNumber) {
    updateRecordOrderNumber(recordTable, recordId, maxOrderNumber + 1, emileDB)

    emileDB
      .prepare(
        `update ${recordTable}
          set orderNumber = orderNumber - 1
          where recordDelete_timeMillis is null
          and orderNumber > ?`
      )
      .run(currentOrderNumber)
  }

  emileDB.close()

  clearCacheByTableName(recordTable)

  return true
}

export function moveRecordUp(
  recordTable: RecordTable,
  recordId: number
): boolean {
  const emileDB = sqlite(databasePath)

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    emileDB
  )

  if (currentOrderNumber <= 0) {
    emileDB.close()
    return true
  }

  emileDB
    .prepare(
      `update ${recordTable}
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
        and orderNumber = ? - 1`
    )
    .run(currentOrderNumber)

  const success = updateRecordOrderNumber(
    recordTable,
    recordId,
    currentOrderNumber - 1,
    emileDB
  )

  emileDB.close()

  clearCacheByTableName(recordTable)

  return success
}

export function moveRecordUpToTop(
  recordTable: RecordTable,
  recordId: number
): boolean {
  const emileDB = sqlite(databasePath)

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    emileDB
  )

  if (currentOrderNumber > 0) {
    updateRecordOrderNumber(recordTable, recordId, -1, emileDB)

    emileDB
      .prepare(
        `update ${recordTable}
          set orderNumber = orderNumber + 1
          where recordDelete_timeMillis is null
          and orderNumber < ?`
      )
      .run(currentOrderNumber)
  }

  emileDB.close()

  clearCacheByTableName(recordTable)

  return true
}
