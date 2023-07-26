import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

export function getUser(userName: string): EmileUser | undefined {
  const emileDB = sqlite(databasePath)

  const user = emileDB
    .prepare(
      `select userName, canLogin, canUpdate, isAdmin
        from Users
        where recordDelete_timeMillis is null
        and userName = ?`
    )
    .get(userName) as EmileUser | undefined

  emileDB.close()

  return user
}
