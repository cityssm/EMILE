import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

export async function getUser(
  userName: string
): Promise<EmileUser | undefined> {
  const emileDB = await getConnectionWhenAvailable(true)

  const user = emileDB
    .prepare(
      `select userName, canLogin, canUpdate, isAdmin, reportKey
        from Users
        where recordDelete_timeMillis is null
        and userName = ?`
    )
    .get(userName) as EmileUser | undefined

  emileDB.close()

  return user
}
