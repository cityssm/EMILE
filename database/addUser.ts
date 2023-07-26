import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

export function addUser(
  user: EmileUser,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): number {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  const rightNowMillis = Date.now()

  const result = emileDB
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

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return result.lastInsertRowid as number
}
