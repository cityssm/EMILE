import type { Request, Response } from 'express'

import { addAssetGroupMember } from '../../database/addAssetGroupMember.js'
import { getAssets } from '../../database/getAssets.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await addAssetGroupMember(
    request.body.groupId,
    request.body.assetId,
    request.session.user as EmileUser
  )

  const groupMembers = await getAssets({
    groupId: request.body.groupId
  })

  response.json({
    success,
    groupMembers
  })
}

export default handler
