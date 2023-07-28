import type { Request, Response } from 'express'

import { addAssetGroup } from '../../database/addAssetGroup.js'
import { getAssetGroups } from '../../database/getAssetGroups.js'

export function handler(request: Request, response: Response): void {
  const groupId = addAssetGroup(request.body, request.session.user as EmileUser)

  const assetGroups = getAssetGroups(request.session.user as EmileUser)

  response.json({
    success: true,
    groupId,
    assetGroups
  })
}

export default handler
