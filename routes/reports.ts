import { Router, type RequestHandler } from 'express'

import handler_reportName from '../handlers/reports-get/reportName.js'
import handler_reports from '../handlers/reports-get/reports.js'

export const router = Router()

router.get('/', handler_reports as RequestHandler)

router.all('/:reportName', handler_reportName as RequestHandler)

export default router
