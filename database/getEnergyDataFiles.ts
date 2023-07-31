// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyDataFile } from '../types/recordTypes.js'

interface GetEnergyDataFilesFilters {
  isPending?: boolean
  isProcessed?: boolean
  isFailed?: boolean
}

interface GetEnergyDataFilesOptions {
  limit: number | -1
  includeSystemFileAndFolder: boolean
  includeAssetDetails: boolean
}

function getEnergyDataFiles(
  filters: GetEnergyDataFilesFilters,
  options: GetEnergyDataFilesOptions
): EnergyDataFile[] {
  let sql = `select f.fileId, f.originalFileName,
    ${
      options.includeSystemFileAndFolder
        ? ' f.systemFileName, f.systemFolderPath,'
        : ''
    }
    f.assetId,
    ${
      options.includeAssetDetails
        ? ' a.assetName, c.category, c.fontAwesomeIconClasses,'
        : ''
    }
    isPending, parserPropertiesJson,
    processedTimeMillis, isFailed, processedMessage,
    f.recordCreate_timeMillis, f.recordUpdate_timeMillis
    from EnergyDataFiles f
    left join Assets a on f.assetId = a.assetId
    left join AssetCategories c on a.categoryId = c.categoryId
    where f.recordDelete_timeMillis is null`

  const sqlParameters: unknown[] = []

  if ((filters.isPending ?? '') !== '') {
    sql += ' and f.isPending = ?'

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    sqlParameters.push(filters.isPending ? 1 : 0)
  }

  if ((filters.isProcessed ?? '') !== '') {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    sql += filters.isProcessed
      ? ' and f.processedTimeMillis is not null'
      : ' and f.processedTimeMillis is null'
  }

  if ((filters.isFailed ?? '') !== '') {
    sql += ' and f.isFailed = ?'

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    sqlParameters.push(filters.isFailed ? 1 : 0)
  }

  sql += ' order by f.recordUpdate_timeMillis desc'

  if (options.limit !== -1) {
    sql += ` limit ${options.limit}`
  }

  const emileDB = sqlite(databasePath, {
    readonly: true
  })

  const assets = emileDB.prepare(sql).all(sqlParameters) as EnergyDataFile[]

  emileDB.close()

  return assets
}

export function getPendingEnergyDataFiles(): EnergyDataFile[] {
  return getEnergyDataFiles(
    {
      isPending: true
    },
    {
      includeAssetDetails: true,
      includeSystemFileAndFolder: false,
      limit: -1
    }
  )
}

export function getFailedEnergyDataFiles(): EnergyDataFile[] {
  return getEnergyDataFiles(
    {
      isFailed: true
    },
    {
      includeAssetDetails: true,
      includeSystemFileAndFolder: false,
      limit: -1
    }
  )
}

export function getProcessedEnergyDataFiles(
  searchString: string
): EnergyDataFile[] {
  return getEnergyDataFiles(
    {
      isProcessed: true,
      isFailed: false
    },
    {
      includeAssetDetails: true,
      includeSystemFileAndFolder: false,
      limit: 100
    }
  )
}

export function getEnergyDataFilesToProcess(): EnergyDataFile[] {
  return getEnergyDataFiles(
    {
      isPending: false,
      isProcessed: false
    },
    {
      includeAssetDetails: false,
      includeSystemFileAndFolder: true,
      limit: -1
    }
  )
}
