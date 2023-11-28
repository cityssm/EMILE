import { type RequestHandler, Router } from 'express'

import handler_assets from '../handlers/assets-get/assets.js'
import handler_doAddAsset from '../handlers/assets-post/doAddAsset.js'
import handler_doAddAssetAlias from '../handlers/assets-post/doAddAssetAlias.js'
import handler_doAddAssetGroup from '../handlers/assets-post/doAddAssetGroup.js'
import handler_doAddAssetGroupMember from '../handlers/assets-post/doAddAssetGroupMember.js'
import handler_doDeleteAsset from '../handlers/assets-post/doDeleteAsset.js'
import handler_doDeleteAssetAlias from '../handlers/assets-post/doDeleteAssetAlias.js'
import handler_doDeleteAssetGroup from '../handlers/assets-post/doDeleteAssetGroup.js'
import handler_doDeleteAssetGroupMember from '../handlers/assets-post/doDeleteAssetGroupMember.js'
import handler_doGetAsset from '../handlers/assets-post/doGetAsset.js'
import handler_doGetAssetGroup from '../handlers/assets-post/doGetAssetGroup.js'
import handler_doMergeAssets from '../handlers/assets-post/doMergeAssets.js'
import handler_doUpdateAsset from '../handlers/assets-post/doUpdateAsset.js'
import handler_doUpdateAssetGroup from '../handlers/assets-post/doUpdateAssetGroup.js'
import { updatePostHandler } from '../handlers/permissions.js'

export const router = Router()

router.get('/', handler_assets as RequestHandler)

// Assets

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
  '/doMergeAssets',
  updatePostHandler,
  handler_doMergeAssets as RequestHandler
)

router.post(
  '/doDeleteAsset',
  updatePostHandler,
  handler_doDeleteAsset as RequestHandler
)

// Asset Aliases

router.post(
  '/doAddAssetAlias',
  updatePostHandler,
  handler_doAddAssetAlias as RequestHandler
)

router.post(
  '/doDeleteAssetAlias',
  updatePostHandler,
  handler_doDeleteAssetAlias as RequestHandler
)

// Asset Groups

router.post(
  '/doAddAssetGroup',
  updatePostHandler,
  handler_doAddAssetGroup as RequestHandler
)

router.post('/doGetAssetGroup', handler_doGetAssetGroup as RequestHandler)

router.post(
  '/doUpdateAssetGroup',
  updatePostHandler,
  handler_doUpdateAssetGroup as RequestHandler
)

router.post(
  '/doAddAssetGroupMember',
  updatePostHandler,
  handler_doAddAssetGroupMember as RequestHandler
)

router.post(
  '/doDeleteAssetGroupMember',
  updatePostHandler,
  handler_doDeleteAssetGroupMember as RequestHandler
)

router.post(
  '/doDeleteAssetGroup',
  updatePostHandler,
  handler_doDeleteAssetGroup as RequestHandler
)

export default router
