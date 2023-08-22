import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

type PermissionValue = 1 | 0 | boolean | '1' | '0'

function updateUserPermission(
  userName: string,
  permission: 'canLogin' | 'canUpdate' | 'isAdmin',
  permissionValue: PermissionValue,
  sessionUser: EmileUser
): boolean {
  const emileDB = sqlite(databasePath)

  const result = emileDB
    .prepare(
      `update Users
        set ${permission} = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and userName = ?`
    )
    .run(permissionValue, sessionUser.userName, Date.now(), userName)

  emileDB.close()

  return result.changes > 0
}

export function updateUserCanLogin(
  userName: string,
  canLogin: PermissionValue,
  sessionUser: EmileUser
): boolean {
  return updateUserPermission(userName, 'canLogin', canLogin, sessionUser)
}

export function updateUserCanUpdate(
  userName: string,
  canUpdate: PermissionValue,
  sessionUser: EmileUser
): boolean {
  return updateUserPermission(userName, 'canUpdate', canUpdate, sessionUser)
}

export function updateUserIsAdmin(
  userName: string,
  isAdmin: PermissionValue,
  sessionUser: EmileUser
): boolean {
  return updateUserPermission(userName, 'isAdmin', isAdmin, sessionUser)
}
