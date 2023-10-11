import { clearCacheByTableName } from '../helpers/functions.cache.js'
import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

import { addAsset } from './addAsset.js'
import { deleteAsset } from './deleteAsset.js'
import { ensureEnergyDataTableExists } from './manageEnergyDataTables.js'

interface MergeAssetsForm {
  assetIds: string
  categoryId: string
  assetName: string
  latitudeLongitude?: '' | `${number}::${number}`
}

export async function mergeAssets(
  assetForm: MergeAssetsForm,
  sessionUser: EmileUser
): Promise<number> {
  const emileDB = await getConnectionWhenAvailable()

  let latitude: number | undefined
  let longitude: number | undefined

  if (
    assetForm.latitudeLongitude !== undefined &&
    assetForm.latitudeLongitude !== ''
  ) {
    const latitudeLongitudeSplit = assetForm.latitudeLongitude.split('::')
    latitude = Number.parseFloat(latitudeLongitudeSplit[0])
    longitude = Number.parseFloat(latitudeLongitudeSplit[1])
  }

  const newAssetId = await addAsset(
    {
      categoryId: Number.parseInt(assetForm.categoryId, 10),
      assetName: assetForm.assetName,
      latitude,
      longitude
    },
    sessionUser,
    emileDB
  )

  const newAssetTableName = await ensureEnergyDataTableExists(newAssetId)

  const mergeAssetIds = assetForm.assetIds.split(',')

  const rightNowMillis = Date.now()

  for (const mergeAssetId of mergeAssetIds) {
    // Move over aliases
    emileDB
      .prepare(
        `update AssetAliases
          set assetId = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
          where recordDelete_timeMillis is null
          and assetId = ?`
      )
      .run(newAssetId, sessionUser.userName, rightNowMillis, mergeAssetId)

    // Move over groups
    emileDB
      .prepare(
        `update AssetGroupMembers
          set assetId = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
          where recordDelete_timeMillis is null
          and assetId = ?
          and groupId not in (select groupId from AssetGroupMembers where assetId = ?)`
      )
      .run(
        newAssetId,
        sessionUser.userName,
        rightNowMillis,
        mergeAssetId,
        newAssetId
      )

    const mergeAssetTableName = await ensureEnergyDataTableExists(
      mergeAssetId,
      emileDB
    )

    // Copy over data
    emileDB
      .prepare(
        `insert into ${newAssetTableName}
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
          from ${mergeAssetTableName}
          where recordDelete_timeMillis is null`
      )
      .run(newAssetId, sessionUser.userName, rightNowMillis)

    // Delete old data
    emileDB
      .prepare(
        `update ${mergeAssetTableName}
          set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
          where recordDelete_timeMillis is null`
      )
      .run(sessionUser.userName, rightNowMillis)

    clearCacheByTableName('EnergyData')

    // Delete asset
    deleteAsset(mergeAssetId, sessionUser, emileDB)
  }

  emileDB.pragma('optimize')

  emileDB.close()

  return newAssetId
}
