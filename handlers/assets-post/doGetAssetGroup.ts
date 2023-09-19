import type { Request, Response } from 'express'

import { getAssetGroup } from '../../database/getAssetGroup.js'

export async function handler(request: Request, response: Response): Promise<void> {
  const assetGroup = await getAssetGroup(
    request.body.groupId,
    request.session.user as EmileUser
  )

  response.json({
    success: assetGroup !== undefined,
    assetGroup
  })
}

export default handler
