import type { Request, Response } from 'express'

import { getAssets } from '../../database/getAssets.js'
import { mergeAssets } from '../../database/mergeAssets.js'

export async function handler(request: Request, response: Response): Promise<void> {
  const assetId = await mergeAssets(request.body, request.session.user as EmileUser)

  const assets = getAssets({}, { includeEnergyDataStats: true })

  response.json({
    success: true,
    assetId,
    assets
  })
}

export default handler
