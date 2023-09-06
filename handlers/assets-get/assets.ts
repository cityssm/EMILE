import type { Request, Response } from 'express'

import { getAssetGroups } from '../../database/getAssetGroups.js'
import { getAssets } from '../../database/getAssets.js'
import {
  getAssetAliasTypes,
  getAssetCategories
} from '../../helpers/functions.cache.js'

export function handler(request: Request, response: Response): void {
  const assets = getAssets({})
  const assetGroups = getAssetGroups(request.session.user as EmileUser)
  const assetCategories = getAssetCategories()

  const assetAliasTypes =
    request.session.user?.canUpdate ?? false ? getAssetAliasTypes() : []

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
