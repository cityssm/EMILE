import type { Request, Response } from 'express'

import { deleteAssetAlias } from '../../database/deleteAssetAlias.js'
import { getAssetAliases } from '../../database/getAssetAliases.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = deleteAssetAlias(
    request.body.aliasId,
    request.session.user as EmileUser
  )

  const assetAliases = await getAssetAliases({
    assetId: request.body.assetId
  })

  response.json({
    success,
    assetAliases
  })
}

export default handler
