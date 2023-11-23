import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getAssetCategories } from '../../helpers/functions.cache.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveRecordUpToTop('AssetCategories', request.body.categoryId)
      : await moveRecordUp('AssetCategories', request.body.categoryId)

  const assetCategories = await getAssetCategories()

  response.json({
    success,
    assetCategories
  })
}

export default handler
