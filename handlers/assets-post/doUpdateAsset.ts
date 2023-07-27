import type { Request, Response } from 'express'

import { getAssets } from '../../database/getAssets.js'
import { updateAsset } from '../../database/updateAsset.js'

export function handler(request: Request, response: Response): void {
  const success = updateAsset(request.body, request.session.user as EmileUser)

  const assets = getAssets()

  response.json({
    success,
    assets
  })
}

export default handler
