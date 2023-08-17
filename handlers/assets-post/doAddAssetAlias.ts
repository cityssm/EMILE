import type { Request, Response } from 'express'

import { addAssetAlias } from '../../database/addAssetAlias.js'
import { getAssetAliases } from '../../database/getAssetAliases.js'

export function handler(request: Request, response: Response): void {
  const aliasId = addAssetAlias(request.body, request.session.user as EmileUser)

  const assetAliases = getAssetAliases({
    assetId: request.body.assetId
  })

  response.json({
    success: true,
    aliasId,
    assetAliases
  })
}

export default handler
