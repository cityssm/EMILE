import type { Request, Response } from 'express'

import { addAsset } from '../../database/addAsset.js'
import { getAssets } from '../../database/getAssets.js'

export function handler(request: Request, response: Response): void {
  const assetId = addAsset(request.body, request.session.user as EmileUser)

  const assets = getAssets()

  response.json({
    assetId,
    assets
  })
}

export default handler
