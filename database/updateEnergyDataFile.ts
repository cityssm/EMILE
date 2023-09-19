/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

interface FailedEnergyDataFile {
  fileId: number
  processedMessage: string
  processedTimeMillis: number
}

export function updateEnergyDataFileAsFailed(
  energyDataFile: FailedEnergyDataFile,
  sessionUser: EmileUser
): boolean {
  const emileDB = sqlite(databasePath)

  const result = emileDB
    .prepare(
      `update EnergyDataFiles
        set isFailed = 1,
        processedTimeMillis = ?,
        processedMessage = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`
    )
    .run(
      energyDataFile.processedTimeMillis,
      energyDataFile.processedMessage,
      sessionUser.userName,
      Date.now(),
      energyDataFile.fileId
    )

  emileDB.close()

  return result.changes > 0
}

interface PendingEnergyDataFile {
  fileId: number | string
  assetId: number | string
  parserClass: string
}

export function updatePendingEnergyDataFile(
  energyDataFile: PendingEnergyDataFile,
  sessionUser: EmileUser
): boolean {
  let parserClass = energyDataFile.parserClass
  let parserConfig = ''

  if (parserClass.includes('::')) {
    parserConfig = parserClass.slice(Math.max(0, parserClass.indexOf('::') + 2))
    parserClass = parserClass.slice(0, Math.max(0, parserClass.indexOf('::')))
  }

  const parserPropertiesJson =
    energyDataFile.parserClass === ''
      ? '{}'
      : JSON.stringify({
          parserClass,
          parserConfig
        })

  const emileDB = sqlite(databasePath)

  const result = emileDB
    .prepare(
      `update EnergyDataFiles
        set assetId = ?,
        parserPropertiesJson = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`
    )
    .run(
      energyDataFile.assetId === '' ? undefined : energyDataFile.assetId,
      parserPropertiesJson,
      sessionUser.userName,
      Date.now(),
      energyDataFile.fileId
    )

  emileDB.close()

  return result.changes > 0
}

export function updateEnergyDataFileAsReadyToPending(
  fileId: string | number,
  sessionUser: EmileUser
): boolean {
  const emileDB = sqlite(databasePath)

  const result = emileDB
    .prepare(
      `update EnergyDataFiles
        set isPending = 1,
        isFailed = 0,
        processedTimeMillis = null,
        processedMessage = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`
    )
    .run(sessionUser.userName, Date.now(), fileId)

  emileDB.close()

  return result.changes > 0
}

export function updateEnergyDataFileAsReadyToProcess(
  fileId: string | number,
  sessionUser: EmileUser
): boolean {
  const emileDB = sqlite(databasePath)

  const result = emileDB
    .prepare(
      `update EnergyDataFiles
        set isPending = 0,
        isFailed = 0,
        processedTimeMillis = null,
        processedMessage = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`
    )
    .run(sessionUser.userName, Date.now(), fileId)

  emileDB.close()

  return result.changes > 0
}

export function updateEnergyDataFileAsProcessed(
  fileId: number,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): boolean {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  const rightNow = Date.now()

  const result = emileDB
    .prepare(
      `update EnergyDataFiles
        set processedTimeMillis = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`
    )
    .run(rightNow, sessionUser.userName, Date.now(), fileId)

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return result.changes > 0
}
