import type { Request, Response } from 'express'

import { deleteAsset } from '../../database/deleteAsset.js'
import { getAssets } from '../../database/getAssets.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteAsset(
    request.body.assetId,
    request.session.user as EmileUser
  )

  const assets = await getAssets({})

  response.json({
    success,
    assets
  })
}

export default handler
