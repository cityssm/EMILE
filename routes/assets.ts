import { Router, type RequestHandler } from 'express'

import handler_assets from '../handlers/assets-get/assets.js'
import handler_doAddAsset from '../handlers/assets-post/doAddAsset.js'
import { updatePostHandler } from '../handlers/permissions.js'

export const router = Router()

router.get('/', handler_assets as RequestHandler)

router.post(
  '/doAddAsset',
  updatePostHandler,
  handler_doAddAsset as RequestHandler
)

export default router
