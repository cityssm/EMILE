import { v4 as uuidV4 } from 'uuid'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

type PermissionValue = 1 | 0 | boolean | '1' | '0'

async function updateUserPermission(
  userName: string,
  permission: 'canLogin' | 'canUpdate' | 'isAdmin',
  permissionValue: PermissionValue,
  sessionUser: EmileUser
): Promise<boolean> {
  const emileDB = await getConnectionWhenAvailable()

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

export async function updateUserCanLogin(
  userName: string,
  canLogin: PermissionValue,
  sessionUser: EmileUser
): Promise<boolean> {
  return await updateUserPermission(userName, 'canLogin', canLogin, sessionUser)
}

export async function updateUserCanUpdate(
  userName: string,
  canUpdate: PermissionValue,
  sessionUser: EmileUser
): Promise<boolean> {
  return await updateUserPermission(
    userName,
    'canUpdate',
    canUpdate,
    sessionUser
  )
}

export async function updateUserIsAdmin(
  userName: string,
  isAdmin: PermissionValue,
  sessionUser: EmileUser
): Promise<boolean> {
  return await updateUserPermission(userName, 'isAdmin', isAdmin, sessionUser)
}

export async function updateUserReportKey(
  userName: string,
  sessionUser: EmileUser
): Promise<string | false> {
  const reportKey = `${userName}-${uuidV4()}`

  const emileDB = await getConnectionWhenAvailable()

  const result = emileDB
    .prepare(
      `update Users
        set reportKey = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and userName = ?`
    )
    .run(reportKey, sessionUser.userName, Date.now(), userName)

  emileDB.close()

  if (result.changes > 0) {
    return reportKey
  }

  return false
}
