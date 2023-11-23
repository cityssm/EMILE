import type { Request, Response } from 'express'

import { addAssetGroup } from '../../database/addAssetGroup.js'
import { getAssetGroups } from '../../database/getAssetGroups.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const groupId = await addAssetGroup(request.body, request.session.user as EmileUser)

  const assetGroups = await getAssetGroups(request.session.user as EmileUser)

  response.json({
    success: true,
    groupId,
    assetGroups
  })
}

export default handler
