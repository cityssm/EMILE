import type { Request, Response } from 'express'

import { getAssetGroups } from '../../database/getAssetGroups.js'
import { getAssets } from '../../database/getAssets.js'
import {
  getAssetCategories,
  getEnergyDataStatistics
} from '../../helpers/functions.cache.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const assets = await getAssets({})
  const assetGroups = await getAssetGroups(request.session.user as EmileUser)
  const assetCategories = await getAssetCategories()

  const energyDataStatistics = await getEnergyDataStatistics()

  response.render('dashboard', {
    headTitle: 'Dashboard',
    menuItem: 'Dashboard',

    assets,
    assetGroups,
    assetCategories,
    energyDataStatistics
  })
}

export default handler
