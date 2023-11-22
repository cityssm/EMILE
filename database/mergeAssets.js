import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { addAsset } from './addAsset.js';
import { deleteAsset } from './deleteAsset.js';
import { ensureEnergyDataTablesExists, refreshAggregatedEnergyDataTables } from './manageEnergyDataTables.js';
export async function mergeAssets(assetForm, sessionUser) {
    const emileDB = await getConnectionWhenAvailable();
    let latitude;
    let longitude;
    if (assetForm.latitudeLongitude !== undefined &&
        assetForm.latitudeLongitude !== '') {
        const latitudeLongitudeSplit = assetForm.latitudeLongitude.split('::');
        latitude = Number.parseFloat(latitudeLongitudeSplit[0]);
        longitude = Number.parseFloat(latitudeLongitudeSplit[1]);
    }
    const newAssetId = await addAsset({
        categoryId: Number.parseInt(assetForm.categoryId, 10),
        assetName: assetForm.assetName,
        latitude,
        longitude
    }, sessionUser, emileDB);
    const newAssetTableNames = await ensureEnergyDataTablesExists(newAssetId);
    const mergeAssetIds = assetForm.assetIds.split(',');
    const rightNowMillis = Date.now();
    for (const mergeAssetId of mergeAssetIds) {
        emileDB
            .prepare(`update AssetAliases
          set assetId = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
          where recordDelete_timeMillis is null
          and assetId = ?`)
            .run(newAssetId, sessionUser.userName, rightNowMillis, mergeAssetId);
        emileDB
            .prepare(`update AssetGroupMembers
          set assetId = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
          where recordDelete_timeMillis is null
          and assetId = ?
          and groupId not in (select groupId from AssetGroupMembers where assetId = ?)`)
            .run(newAssetId, sessionUser.userName, rightNowMillis, mergeAssetId, newAssetId);
        const mergeAssetTableNames = await ensureEnergyDataTablesExists(mergeAssetId, emileDB);
        emileDB
            .prepare(`insert into ${newAssetTableNames.raw}
          (assetId, dataTypeId, fileId,
            timeSeconds, durationSeconds,
            dataValue, powerOfTenMultiplier,
            recordCreate_userName, recordCreate_timeMillis,
            recordUpdate_userName, recordUpdate_timeMillis)

          select
            ? as assetId,
            dataTypeId, fileId,
            timeSeconds, durationSeconds,
            dataValue, powerOfTenMultiplier,
            recordCreate_userName, recordCreate_timeMillis,
            ? as recordUpdate_userName,
            ? as recordUpdate_timeMillis
          from ${mergeAssetTableNames.raw}
          where recordDelete_timeMillis is null`)
            .run(newAssetId, sessionUser.userName, rightNowMillis);
        emileDB
            .prepare(`update ${mergeAssetTableNames.raw}
          set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
          where recordDelete_timeMillis is null`)
            .run(sessionUser.userName, rightNowMillis);
        emileDB.prepare(`delete from ${mergeAssetTableNames.daily}`).run();
        emileDB.prepare(`delete from ${mergeAssetTableNames.monthly}`).run();
        clearCacheByTableName('EnergyData');
        deleteAsset(mergeAssetId, sessionUser, emileDB);
    }
    refreshAggregatedEnergyDataTables(newAssetId, emileDB);
    emileDB.pragma('optimize');
    emileDB.close();
    return newAssetId;
}
