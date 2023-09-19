import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { addAsset } from './addAsset.js';
import { deleteAsset } from './deleteAsset.js';
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
    const newAssetId = addAsset({
        categoryId: Number.parseInt(assetForm.categoryId, 10),
        assetName: assetForm.assetName,
        latitude,
        longitude
    }, sessionUser, emileDB);
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
        emileDB
            .prepare(`update EnergyData
          set assetId = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
          where recordDelete_timeMillis is null
          and assetId = ?`)
            .run(newAssetId, sessionUser.userName, rightNowMillis, mergeAssetId);
        deleteAsset(mergeAssetId, sessionUser, emileDB);
    }
    emileDB.close();
    return newAssetId;
}
