import type { Request, Response } from 'express'

import { updateAssetCategory } from '../../database/updateAssetCategory.js'
import { getAssetCategories } from '../../helpers/functions.cache.js'

export function handler(request: Request, response: Response): void {
  const categoryId = updateAssetCategory(
    {
      categoryId: request.body.categoryId,
      category: request.body.category,
      fontAwesomeIconClasses: `${
        request.body['fontAwesomeIconClass-style'] as 'fas' | 'far'
      } fa-${request.body['fontAwesomeIconClass-className'] as string}`
    },
    request.session.user as EmileUser
  )

  const assetCategories = getAssetCategories()

  response.json({
    success: true,
    categoryId,
    assetCategories
  })
}

export default handler