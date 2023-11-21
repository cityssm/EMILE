import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

export async function deleteEnergyDataFile(
  fileId: number | string,
  sessionUser: EmileUser
): Promise<boolean> {
  const emileDB = await getConnectionWhenAvailable()

  const result = emileDB
    .prepare(
      `update EnergyDataFiles
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and fileId = ?`
    )
    .run(sessionUser.userName, Date.now(), fileId)

  emileDB.close()

  return result.changes > 0
}
