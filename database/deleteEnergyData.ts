import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

import {
  ensureEnergyDataTableExists,
  reloadEnergyDataTableNames
} from './manageEnergyDataTables.js'

export async function deleteEnergyData(
  assetId: number | string,
  dataId: number | string,
  sessionUser: EmileUser
): Promise<boolean> {
  const emileDB = await getConnectionWhenAvailable()

  const tableName = await ensureEnergyDataTableExists(assetId, emileDB)

  const result = emileDB
    .prepare(
      `update ${tableName}
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and dataId = ?`
    )
    .run(sessionUser.userName, Date.now(), dataId)

  emileDB.close()

  return result.changes > 0
}

export async function deleteEnergyDataByFileId(
  fileId: number | string,
  sessionUser: EmileUser
): Promise<boolean> {
  const emileDB = await getConnectionWhenAvailable()

  const tableNames = await reloadEnergyDataTableNames(emileDB)

  let count = 0

  for (const tableName of tableNames) {
    const result = emileDB
      .prepare(
        `update ${tableName}
          set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
          where recordDelete_timeMillis is null
          and fileId = ?`
      )
      .run(sessionUser.userName, Date.now(), fileId)

    count += result.changes
  }

  emileDB.close()

  return count > 0
}
