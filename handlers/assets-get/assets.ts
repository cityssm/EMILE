import type { Request, Response } from 'express'

import { getAssetCategories } from '../../database/getAssetCategories.js'
import { getAssetGroups } from '../../database/getAssetGroups.js'
import { getAssets } from '../../database/getAssets.js'

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
