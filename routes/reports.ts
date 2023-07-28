import { Router } from 'express'

import handler_reportName from '../handlers/reports-get/reportName.js'
import handler_reports from '../handlers/reports-get/reports.js'

export const router = Router()

router.get('/', handler_reports)

router.all('/:reportName', handler_reportName)

export default router
