import { Router } from 'express'

import handler_admin from '../handlers/admin-get/admin.js'
import handler_database from '../handlers/admin-get/database.js'
import handler_tables from '../handlers/admin-get/tables.js'
import handler_users from '../handlers/admin-get/users.js'

export const router = Router()

router.get('/', handler_admin)

/*
 * User Maintenance
 */

router.get('/users', handler_users)

/*
 * Database Maintenance
 */

router.get('/database', handler_database)

/*
 * Table Maintenance
 */

router.get('/tables', handler_tables)

export default router
