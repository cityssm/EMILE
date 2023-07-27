import type { Request, Response } from 'express'

import { deleteAsset } from '../../database/deleteAsset.js'
import { getAssets } from '../../database/getAssets.js'

export function handler(request: Request, response: Response): void {
  const success = deleteAsset(
    request.body.assetId,
    request.session.user as EmileUser
  )

  const assets = getAssets()

  response.json({
    success,
    assets
  })
}

export default handler
