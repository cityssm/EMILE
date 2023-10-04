import { isLocal } from '@cityssm/is-private-network-address'
import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

export async function addUserAccessLog(
  sessionUser: EmileUser,
  requestIp: string
): Promise<boolean> {
  const ipAddress = isLocal(requestIp) ? 'localhost' : requestIp
  const rightNowMillis = Date.now()

  let emileDB: sqlite.Database | undefined

  try {
    emileDB = await getConnectionWhenAvailable()

    const result = emileDB
      .prepare(
        `insert into UserAccessLog
        (userName, ipAddress, accessTimeMillis)
        values (?, ?, ?)`
      )
      .run(sessionUser.userName, ipAddress, rightNowMillis)

    return result.changes > 0
  } catch {
    // ignore
    return false
  } finally {
    if (emileDB !== undefined) {
      emileDB.close()
    }
  }
}
