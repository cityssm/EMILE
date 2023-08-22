import { Router } from 'express'

import handler_admin from '../handlers/admin-get/admin.js'
import handler_database from '../handlers/admin-get/database.js'
import handler_tables from '../handlers/admin-get/tables.js'
import handler_users from '../handlers/admin-get/users.js'
import handler_doAddUser from '../handlers/admin-post/doAddUser.js'
import handler_doDeleteUser from '../handlers/admin-post/doDeleteUser.js'
import handler_doUpdateUserCanLogin from '../handlers/admin-post/doUpdateUserCanLogin.js'
import handler_doUpdateUserCanUpdate from '../handlers/admin-post/doUpdateUserCanUpdate.js'
import handler_doUpdateUserIsAdmin from '../handlers/admin-post/doUpdateUserIsAdmin.js'

export const router = Router()

router.get('/', handler_admin)

/*
 * User Maintenance
 */

router.get('/users', handler_users)

router.post('/doAddUser', handler_doAddUser)
router.post('/doUpdateUserCanLogin', handler_doUpdateUserCanLogin)
router.post('/doUpdateUserCanUpdate', handler_doUpdateUserCanUpdate)
router.post('/doUpdateUserIsAdmin', handler_doUpdateUserIsAdmin)
router.post('/doDeleteUser', handler_doDeleteUser)

/*
 * Database Maintenance
 */

router.get('/database', handler_database)

/*
 * Table Maintenance
 */

router.get('/tables', handler_tables)

export default router
