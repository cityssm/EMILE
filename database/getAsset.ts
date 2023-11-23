// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type sqlite from 'better-sqlite3'
import NodeCache from 'node-cache'

import {
  getConnectionWhenAvailable
} from '../helpers/functions.database.js'
import type { Asset } from '../types/recordTypes.js'

import { getAssetAliases } from './getAssetAliases.js'

export async function getAsset(
  assetId: string | number,
  connectedEmileDB?: sqlite.Database
): Promise<Asset | undefined> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true))

  const asset = emileDB
    .prepare(
      `select a.assetId, a.assetName, a.latitude, a.longitude,
        a.categoryId, c.category, c.fontAwesomeIconClasses
        from Assets a
        left join AssetCategories c on a.categoryId = c.categoryId
        where a.recordDelete_timeMillis is null
        and a.assetId = ?`
    )
    .get(assetId) as Asset | undefined

  if (asset !== undefined) {
    asset.assetAliases = await getAssetAliases(
      {
        assetId: asset.assetId as number
      },
      emileDB
    )
  }

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return asset
}

const assetAliasCache = new NodeCache({
  stdTTL: 30
})

function getAssetAliasCacheKey(
  assetAlias: string,
  aliasTypeId?: number | string
): string {
  return `${aliasTypeId ?? ''}::::${assetAlias}`
}

export async function getAssetByAssetAlias(
  assetAlias: string,
  aliasTypeId?: number | string,
  connectedEmileDB?: sqlite.Database
): Promise<Asset | undefined> {
  const assetAliasCacheKey = getAssetAliasCacheKey(assetAlias, aliasTypeId)

  let asset = assetAliasCache.get<Asset>(assetAliasCacheKey)

  if (asset !== undefined) {
    return asset
  }

  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  let sql = `select assetId from AssetAliases
    where recordDelete_timeMillis is null
    and assetId in (select assetId from Assets where recordDelete_timeMillis is null)
    and assetAlias = ?`

  const sqlParameters: unknown[] = [assetAlias]

  if (aliasTypeId !== undefined) {
    sql += ' and aliasTypeId = ?'
    sqlParameters.push(aliasTypeId)
  }

  const assetId = emileDB.prepare(sql).pluck().get(sqlParameters) as
    | number
    | undefined

  if (assetId !== undefined) {
    asset = await getAsset(assetId, emileDB)
  }

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  assetAliasCache.set(assetAliasCacheKey, asset)

  return asset
}
