import type { Request, Response } from 'express'

import { getAssetGroups } from '../../database/getAssetGroups.js'
import { getAssets } from '../../database/getAssets.js'
import { getAssetCategories } from '../../helpers/functions.cache.js'

export function handler(request: Request, response: Response): void {
  const assets = getAssets()
  const assetGroups = getAssetGroups(request.session.user as EmileUser)
  const assetCategories = getAssetCategories()

  response.render('assets', {
    headTitle: 'Assets',
    assets,
    assetGroups,
    assetCategories
  })
}

export default handler
