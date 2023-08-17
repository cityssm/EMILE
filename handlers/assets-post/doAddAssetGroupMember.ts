import type { Request, Response } from 'express'

import { addAssetGroupMember } from '../../database/addAssetGroupMember.js'
import { getAssets } from '../../database/getAssets.js'

export function handler(request: Request, response: Response): void {
  const success = addAssetGroupMember(
    request.body.groupId,
    request.body.assetId,
    request.session.user as EmileUser
  )

  const groupMembers = getAssets({
    groupId: request.body.groupId
  })

  response.json({
    success,
    groupMembers
  })
}

export default handler
