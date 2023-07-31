import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

export type ReportParameters = Record<string, string | number>

export function getReportData(
  reportName: string,
  reportParameters: ReportParameters = {}
): unknown[] | undefined {
  const emileDB = sqlite(databasePath, {
    readonly: true
  })

  let sql = ''

  switch (reportName) {
    /*
     * Employees
     */

    case 'assets-all': {
      sql = 'select * from Assets'
      break
    }

    case 'assets-formatted': {
      sql = `select a.assetId, a.assetName,
        a.categoryId, c.category
        from Assets a
        left join AssetCategories c on a.categoryId = c.categoryId
        where a.recordDelete_timeMillis is null
        order by a.assetName, c.category`
      break
    }

    /*
     * Default
     */

    default: {
      return undefined
    }
  }

  const resultRows = emileDB.prepare(sql).all()

  emileDB.close()

  return resultRows
}

export default getReportData
