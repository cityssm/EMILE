import type { Request, Response } from 'express'

import { addAsset } from '../../database/addAsset.js'
import { getAssets } from '../../database/getAssets.js'

export async function handler(request: Request, response: Response): Promise<void> {
  const assetId = await addAsset(request.body, request.session.user as EmileUser)

  const assets = await getAssets({}, { includeEnergyDataStats: true })

  response.json({
    success: true,
    assetId,
    assets
  })
}

export default handler
