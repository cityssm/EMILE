import { Router, type RequestHandler } from 'express'

import handler_dashboard from '../handlers/dashboard-get/dashboard.js'

export const router = Router()

router.get('/', handler_dashboard as RequestHandler)

export default router
