import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

export interface EnergyDataStatistics {
  assetIdCount: number
  timeSecondsMin: number
  endTimeSecondsMax: number
}

export async function getEnergyDataStatistics(): Promise<EnergyDataStatistics> {
  const emileDB = await getConnectionWhenAvailable(true)

  const statistics = emileDB
    .prepare(
      `select 
        count(assetId) as assetIdCount,
        min(timeSecondsMin) as timeSecondsMin,
        max(endTimeSecondsMax) as endTimeSecondsMax
        from Assets
        where recordDelete_timeMillis is null`
    )
    .get() as EnergyDataStatistics

  emileDB.close()

  return statistics
}
