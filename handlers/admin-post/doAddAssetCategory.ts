import type { Request, Response } from 'express'

import { addAssetCategory } from '../../database/addAssetCategory.js'
import { getAssetCategories } from '../../helpers/functions.cache.js'

export async function handler(request: Request, response: Response): Promise<void> {
  const categoryId = await addAssetCategory(
    {
      category: request.body.category,
      fontAwesomeIconClasses: `${
        request.body['fontAwesomeIconClass-style'] as 'fas' | 'far'
      } fa-${request.body['fontAwesomeIconClass-className'] as string}`
    },
    request.session.user as EmileUser
  )

  const assetCategories = await getAssetCategories()

  response.json({
    success: true,
    categoryId,
    assetCategories
  })
}

export default handler
