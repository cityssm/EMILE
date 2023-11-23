import type { Request, Response } from 'express'

import { deleteAssetCategory } from '../../database/deleteAssetCategory.js'
import { getAssetCategories } from '../../helpers/functions.cache.js'

export async function handler(request: Request, response: Response): Promise<void> {
  const success = deleteAssetCategory(
    request.body.categoryId,
    request.session.user as EmileUser
  )

  const assetCategories = await getAssetCategories()

  response.json({
    success,
    assetCategories
  })
}

export default handler
