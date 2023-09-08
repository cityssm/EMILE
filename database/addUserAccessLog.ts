import { isLocal } from '@cityssm/is-private-network-address'
import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

export function addUserAccessLog(
  sessionUser: EmileUser,
  requestIp: string
): boolean {
  const emileDB = sqlite(databasePath)

  const ipAddress = isLocal(requestIp) ? 'localhost' : requestIp
  const rightNowMillis = Date.now()

  const result = emileDB
    .prepare(
      `insert into UserAccessLog
        (userName, ipAddress, accessTimeMillis)
        values (?, ?, ?)`
    )
    .run(sessionUser.userName, ipAddress, rightNowMillis)

  emileDB.close()

  return result.changes > 0
}
