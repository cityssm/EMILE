import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

export async function getUsers(): Promise<EmileUser[]> {
  const emileDB = await getConnectionWhenAvailable(true)

  const users = emileDB
    .prepare(
      `select userName, canLogin, canUpdate, isAdmin
        from Users
        where recordDelete_timeMillis is null`
    )
    .all() as EmileUser[]

  emileDB.close()

  return users
}
