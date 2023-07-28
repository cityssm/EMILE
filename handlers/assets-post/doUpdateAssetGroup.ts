import type { Request, Response } from 'express'

import { getAssetGroups } from '../../database/getAssetGroups.js'
import { updateAssetGroup } from '../../database/updateAssetGroup.js'

export function handler(request: Request, response: Response): void {
  const success = updateAssetGroup(
    request.body,
    request.session.user as EmileUser
  )

  const assetGroups = getAssetGroups(request.session.user as EmileUser)

  response.json({
    success,
    assetGroups
  })
}

export default handler
