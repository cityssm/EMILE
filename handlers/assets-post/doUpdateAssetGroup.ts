import type { Request, Response } from 'express'

import { getAssetGroups } from '../../database/getAssetGroups.js'
import { updateAssetGroup } from '../../database/updateAssetGroup.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateAssetGroup(
    request.body,
    request.session.user as EmileUser
  )

  const assetGroups = await getAssetGroups(request.session.user as EmileUser)

  response.json({
    success,
    assetGroups
  })
}

export default handler
