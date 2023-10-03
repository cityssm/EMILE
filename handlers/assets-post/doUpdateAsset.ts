import type { Request, Response } from 'express'

import { getAssets } from '../../database/getAssets.js'
import { updateAsset } from '../../database/updateAsset.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = updateAsset(request.body, request.session.user as EmileUser)

  const assets = await getAssets({})

  response.json({
    success,
    assets
  })
}

export default handler
