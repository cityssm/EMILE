import { type RequestHandler, Router } from 'express'

import handler_data from '../handlers/data-get/data.js'
import handler_doDeletePendingEnergyDataFile from '../handlers/data-post/doDeletePendingEnergyDataFile.js'
import handler_doDeleteProcessedEnergyDataFile from '../handlers/data-post/doDeleteProcessedEnergyDataFile.js'
import handler_doGetPendingFiles from '../handlers/data-post/doGetPendingFiles.js'
import handler_doProcessPendingEnergyDataFile from '../handlers/data-post/doProcessPendingEnergyDataFile.js'
import handler_doReprocessProcessedEnergyDataFile from '../handlers/data-post/doReprocessProcessedEnergyDataFile.js'
import handler_doUpdatePendingEnergyDataFile from '../handlers/data-post/doUpdatePendingEnergyDataFile.js'
import { handlers as handlers_doUploadDataFiles } from '../handlers/data-post/doUploadDataFiles.js'

export const router = Router()

router.get('/', handler_data as RequestHandler)

router.post(
  '/doUploadDataFiles',
  handlers_doUploadDataFiles.uploadHander.array('file'),
  handlers_doUploadDataFiles.successHandler as RequestHandler
)

router.post(
  '/doUpdatePendingEnergyDataFile',
  handler_doUpdatePendingEnergyDataFile as RequestHandler
)

router.post('/doGetPendingFiles', handler_doGetPendingFiles as RequestHandler)

router.post(
  '/doProcessPendingEnergyDataFile',
  handler_doProcessPendingEnergyDataFile as RequestHandler
)

router.post(
  '/doDeletePendingEnergyDataFile',
  handler_doDeletePendingEnergyDataFile as RequestHandler
)

router.post(
  '/doReprocessProcessedEnergyDataFile',
  handler_doReprocessProcessedEnergyDataFile as RequestHandler
)

router.post(
  '/doDeleteProcessedEnergyDataFile',
  handler_doDeleteProcessedEnergyDataFile as RequestHandler
)

export default router
