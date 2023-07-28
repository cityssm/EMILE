import type { Request, Response } from 'express'

import { getAssetGroup } from '../../database/getAssetGroup.js'

export function handler(request: Request, response: Response): void {
  const assetGroup = getAssetGroup(
    request.body.groupId,
    request.session.user as EmileUser
  )

  response.json({
    success: assetGroup !== undefined,
    assetGroup
  })
}

export default handler
