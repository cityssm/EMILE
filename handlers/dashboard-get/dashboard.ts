import type { Request, Response } from 'express'

import { getAssetGroups } from '../../database/getAssetGroups.js'
import { getAssets } from '../../database/getAssets.js'
import { getEnergyDataStatistics } from '../../database/getEnergyDataStatistics.js'
import { getAssetCategories } from '../../helpers/functions.cache.js'

export function handler(request: Request, response: Response): void {
  const assets = getAssets()
  const assetGroups = getAssetGroups(request.session.user as EmileUser)
  const assetCategories = getAssetCategories()

  const energyDataStatistics = getEnergyDataStatistics()

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
