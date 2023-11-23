import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getAssetCategories } from '../../helpers/functions.cache.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveRecordDownToBottom('AssetCategories', request.body.categoryId)
      : await moveRecordDown('AssetCategories', request.body.categoryId)

  const assetCategories = await getAssetCategories()

  response.json({
    success,
    assetCategories
  })
}

export default handler
