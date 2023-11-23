import type { Request, Response } from 'express'

import { getAssetGroups } from '../../database/getAssetGroups.js'
import { getAssets } from '../../database/getAssets.js'
import {
  getAssetAliasTypes,
  getAssetCategories
} from '../../helpers/functions.cache.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const assets = await getAssets({})
  const assetGroups = await getAssetGroups(request.session.user as EmileUser)
  const assetCategories = await getAssetCategories()

  const assetAliasTypes =
    request.session.user?.canUpdate ?? false ? await getAssetAliasTypes() : []

  response.render('assets', {
    headTitle: 'Assets',
    menuItem: 'Assets',

    assets,
    assetGroups,
    assetCategories,
    assetAliasTypes
  })
}

export default handler
