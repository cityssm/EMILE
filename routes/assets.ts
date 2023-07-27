import { Router, type RequestHandler } from 'express'

import handler_assets from '../handlers/assets-get/assets.js'
import handler_doAddAsset from '../handlers/assets-post/doAddAsset.js'
import handler_doDeleteAsset from '../handlers/assets-post/doDeleteAsset.js'
import handler_doGetAsset from '../handlers/assets-post/doGetAsset.js'
import handler_doUpdateAsset from '../handlers/assets-post/doUpdateAsset.js'
import { updatePostHandler } from '../handlers/permissions.js'

export const router = Router()

router.get('/', handler_assets as RequestHandler)

router.post(
  '/doAddAsset',
  updatePostHandler,
  handler_doAddAsset as RequestHandler
)

router.post('/doGetAsset', handler_doGetAsset as RequestHandler)

router.post(
  '/doUpdateAsset',
  updatePostHandler,
  handler_doUpdateAsset as RequestHandler
)

router.post(
  '/doDeleteAsset',
  updatePostHandler,
  handler_doDeleteAsset as RequestHandler
)

export default router
