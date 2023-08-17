import type { Request, Response } from 'express'

import { deleteAssetAlias } from '../../database/deleteAssetAlias.js'
import { getAssetAliases } from '../../database/getAssetAliases.js'

export function handler(request: Request, response: Response): void {
  const success = deleteAssetAlias(
    request.body.aliasId,
    request.session.user as EmileUser
  )

  const assetAliases = getAssetAliases({
    assetId: request.body.assetId
  })

  response.json({
    success,
    assetAliases
  })
}

export default handler
