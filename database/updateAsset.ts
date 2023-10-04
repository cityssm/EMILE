// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'
import Debug from 'debug'

import {
  databasePath,
  getConnectionWhenAvailable,
  getTempTableName
} from '../helpers/functions.database.js'
import type { Asset } from '../types/recordTypes.js'

import { getAssets } from './getAssets.js'
import { ensureEnergyDataTableExists } from './manageEnergyDataTables.js'

const debug = Debug('emile:database:updateAsset')

export function updateAsset(asset: Asset, sessionUser: EmileUser): boolean {
  const emileDB = sqlite(databasePath)

  const result = emileDB
    .prepare(
      `update Assets
        set assetName = ?,
        categoryId = ?,
        latitude = ?,
        longitude = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and assetId = ?`
    )
    .run(
      asset.assetName,
      asset.categoryId,
      (asset.latitude ?? '') === '' ? undefined : asset.latitude,
      (asset.longitude ?? '') === '' ? undefined : asset.longitude,
      sessionUser.userName,
      Date.now(),
      asset.assetId
    )

  emileDB.close()

  return result.changes > 0
}

export async function updateAssetTimeSeconds(
  assetId: number | string,
  connectedEmileDB?: sqlite.Database
): Promise<boolean> {
  const tempTableName = getTempTableName()

  const tableName = await ensureEnergyDataTableExists(assetId)

  const emileDB =
    connectedEmileDB === undefined
      ? await getConnectionWhenAvailable()
      : connectedEmileDB

  emileDB
    .prepare(
      `create temp table ${tempTableName} as 
        select min(timeSeconds) as timeSecondsMin,
        max(endTimeSeconds) as endTimeSecondsMax
        from ${tableName}
        where recordDelete_timeMillis is null`
    )
    .run()

  const result = emileDB.prepare(`select * from ${tempTableName}`).get() as
    | {
        timeSecondsMin: number
        endTimeSecondsMax: number
      }
    | undefined

  for (let retries = 0; retries <= 10; retries += 1) {
    try {
      emileDB
        .prepare(
          `update Assets
            set timeSecondsMin = ?,
            endTimeSecondsMax = ?
            where assetId = ?`
        )
        .run(
          result?.timeSecondsMin ?? undefined,
          result?.endTimeSecondsMax ?? undefined,
          assetId
        )

      break
    } catch {
      debug('Try again')
    }
  }

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return true
}

export async function updateAllAssetTimeSeconds(): Promise<void> {
  const emileDB = await getConnectionWhenAvailable()

  const assets = await getAssets({}, emileDB)

  for (const asset of assets) {
    await updateAssetTimeSeconds(asset.assetId as number, emileDB)
  }

  emileDB.close()
}
