import type { Request, Response } from 'express'

import { addAssetAlias } from '../../database/addAssetAlias.js'
import { getAssetAliases } from '../../database/getAssetAliases.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const aliasId = await addAssetAlias(
    request.body,
    request.session.user as EmileUser
  )

  const assetAliases = await getAssetAliases({
    assetId: request.body.assetId
  })

  response.json({
    success: true,
    aliasId,
    assetAliases
  })
}

export default handler
