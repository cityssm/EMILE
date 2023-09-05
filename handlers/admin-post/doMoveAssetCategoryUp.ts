import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getAssetCategories } from '../../helpers/functions.cache.js'

export function handler(request: Request, response: Response): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('AssetCategories', request.body.categoryId)
      : moveRecordUp('AssetCategories', request.body.categoryId)

  const assetCategories = getAssetCategories()

  response.json({
    success,
    assetCategories
  })
}

export default handler
