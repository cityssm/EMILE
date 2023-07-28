import { Router } from 'express'

import handler_data from '../handlers/data-get/data.js'

export const router = Router()

router.get('/', handler_data)

export default router
