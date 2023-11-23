import type { Request, Response } from 'express'

import { getAsset } from '../../database/getAsset.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const asset = await getAsset(request.body.assetId)

  response.json({
    success: asset !== undefined,
    asset
  })
}

export default handler
