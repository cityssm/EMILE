import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

interface EnergyDataStatistics {
  dataIdCount: number

  assetIdDistinctCount: number

  fileIdDistinctCount: number

  timeSecondsMin: number
  endTimeSecondsMax: number
}

export function getEnergyDataStatistics(): EnergyDataStatistics {
  const emileDB = sqlite(databasePath, {
    readonly: true
  })

  const statistics = emileDB
    .prepare(
      `select count(dataId) as dataIdCount,
        count(distinct assetId) as assetIdDistinctCount,
        count(distinct fileId) as fileIdDistinctCount,
        min(timeSeconds) as timeSecondsMin,
        max(endTimeSeconds) as endTimeSecondsMax
        from EnergyData
        where recordDelete_timeMillis is null`
    )
    .get() as EnergyDataStatistics

  emileDB.close()

  return statistics
}
