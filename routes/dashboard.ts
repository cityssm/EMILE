import { Router } from 'express'

import handler_dashboard from '../handlers/dashboard-get/dashboard.js'
import handler_doGetEnergyData from '../handlers/dashboard-post/doGetEnergyData.js'

export const router = Router()

router.get('/', handler_dashboard)

router.post('/doGetEnergyData', handler_doGetEnergyData)

export default router
