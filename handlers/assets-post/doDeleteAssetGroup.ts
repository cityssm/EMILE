import type { Request, Response } from 'express'

import { deleteAssetGroup } from '../../database/deleteAssetGroup.js'
import { getAssetGroups } from '../../database/getAssetGroups.js'

export function handler(request: Request, response: Response): void {
  const success = deleteAssetGroup(
    request.body.groupId,
    request.session.user as EmileUser
  )

  const assetGroups = getAssetGroups(request.session.user as EmileUser)

  response.json({
    success,
    assetGroups
  })
}

export default handler
