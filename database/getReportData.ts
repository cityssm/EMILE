import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'

import { getEnergyData } from './getEnergyData.js'

export type ReportParameters = Record<string, string | number>

export function getReportData(
  reportName: string,
  reportParameters: ReportParameters = {}
): unknown[] | undefined {
  let sql = ''

  switch (reportName) {
    /*
     * Assets
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
     * Energy Data
     */

    case 'energyData-formatted-filtered': {
      return getEnergyData(
        {
          assetId: reportParameters.assetId,
          categoryId: reportParameters.categoryId,
          groupId: reportParameters.groupId,
          dataTypeId: reportParameters.dataTypeId,
          fileId: reportParameters.fileId,
          startDateString: reportParameters.startDateString as string,
          endDateString: reportParameters.endDateString as string,
          timeSecondsMin: reportParameters.timeSecondsMin,
          timeSecondsMax: reportParameters.timeSecondsMax
        },
        {
          formatForExport: true
        }
      )
    }

    /*
     * Default
     */

    default: {
      return undefined
    }
  }

  const emileDB = sqlite(databasePath, {
    readonly: true
  })

  const resultRows = emileDB.prepare(sql).all()

  emileDB.close()

  return resultRows
}

export default getReportData
