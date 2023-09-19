import type { Request, Response } from 'express'

import { getAssetGroups } from '../../database/getAssetGroups.js'
import { getAssets } from '../../database/getAssets.js'
import { getAssetCategories } from '../../helpers/functions.cache.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const assets = await getAssets({})
  const assetGroups = getAssetGroups(request.session.user as EmileUser)
  const assetCategories = getAssetCategories()

  response.render('reports', {
    headTitle: 'Reports',
    menuItem: 'Reports',

    assets,
    assetGroups,
    assetCategories
  })
}

export default handler
