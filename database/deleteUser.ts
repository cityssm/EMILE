import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

export function deleteUser(userName: string, sessionUser: EmileUser): boolean {
  const emileDB = sqlite(databasePath)

  const result = emileDB
    .prepare(
      `update Users
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and userName = ?`
    )
    .run(sessionUser.userName, Date.now(), userName)

  emileDB.close()

  return result.changes > 0
}
