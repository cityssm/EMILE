import type { Request, Response } from 'express'

import { getAsset } from '../../database/getAsset.js'

export function handler(request: Request, response: Response): void {
  const asset = getAsset(request.body.assetId)

  response.json({
    success: asset !== undefined,
    asset
  })
}

export default handler
