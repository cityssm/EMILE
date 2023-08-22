import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

export function addUser(
  user: EmileUser,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): boolean {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare('select recordDelete_timeMillis from Users where userName = ?')
    .get(user.userName) as
    | { recordDelete_timeMillis: null | number }
    | undefined

  if (result === undefined) {
    emileDB
      .prepare(
        `insert into Users (
        userName, canLogin, canUpdate, isAdmin,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        user.userName,
        user.canLogin ? 1 : 0,
        user.canUpdate ? 1 : 0,
        user.isAdmin ? 1 : 0,
        sessionUser.userName,
        rightNowMillis,
        sessionUser.userName,
        rightNowMillis
      )
  } else if (result.recordDelete_timeMillis !== null) {
    emileDB
      .prepare(
        `update Users
          set canLogin = ?,
          canUpdate = ?,
          isAdmin = ?,
          recordDelete_userName = null,
          recordDelete_timeMillis = null,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
          where userName = ?
          and recordDelete_timeMillis is not null`
      )
      .run(
        user.canLogin ? 1 : 0,
        user.canUpdate ? 1 : 0,
        user.isAdmin ? 1 : 0,
        sessionUser.userName,
        rightNowMillis,
        user.userName
      )
  }

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return true
}
