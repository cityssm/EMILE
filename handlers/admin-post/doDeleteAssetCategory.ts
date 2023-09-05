import type { Request, Response } from 'express'

import { deleteAssetCategory } from '../../database/deleteAssetCategory.js'
import { getAssetCategories } from '../../helpers/functions.cache.js'

export function handler(request: Request, response: Response): void {
  const success = deleteAssetCategory(
    request.body.categoryId,
    request.session.user as EmileUser
  )

  const assetCategories = getAssetCategories()

  response.json({
    success,
    assetCategories
  })
}

export default handler
