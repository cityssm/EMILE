import type sqlite from 'better-sqlite3'
import Debug from 'debug'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import { delay } from '../helpers/functions.utilities.js'
import type { EnergyData } from '../types/recordTypes.js'

const debug = Debug('emile:database:addEnergyData')

export async function addEnergyData(
  data: Partial<EnergyData>,
  sessionUser: EmileUser,
  connectedEmileDB?: sqlite.Database
): Promise<number> {
  const emileDB =
    connectedEmileDB === undefined
      ? await getConnectionWhenAvailable()
      : connectedEmileDB

  let result: sqlite.RunResult | undefined

  for (let retries = 0; retries <= 5; retries += 1) {
    try {
      const rightNowMillis = Date.now()

      result = emileDB
        .prepare(
          `insert into EnergyData (
            assetId, dataTypeId, fileId,
            timeSeconds, durationSeconds, dataValue, powerOfTenMultiplier,
            recordCreate_userName, recordCreate_timeMillis,
            recordUpdate_userName, recordUpdate_timeMillis)
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          data.assetId,
          data.dataTypeId,
          data.fileId,
          data.timeSeconds,
          data.durationSeconds,
          data.dataValue,
          data.powerOfTenMultiplier ?? 0,
          sessionUser.userName,
          rightNowMillis,
          sessionUser.userName,
          rightNowMillis
        )

      break
    } catch {
      debug('Waiting 1s ...')
      await delay(1000)
    }
  }

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return result.lastInsertRowid as number
}
