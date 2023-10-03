import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getEnergyDataStatistics() {
    const emileDB = await getConnectionWhenAvailable(true);
    const statistics = emileDB
        .prepare(`select 
        count(assetId) as assetIdCount,
        min(timeSecondsMin) as timeSecondsMin,
        max(endTimeSecondsMax) as endTimeSecondsMax
        from Assets
        where recordDelete_timeMillis is null`)
        .get();
    emileDB.close();
    return statistics;
}
