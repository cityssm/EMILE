// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type sqlite from 'better-sqlite3'

import {
  getConnectionWhenAvailable,
  getTempTableName
} from '../helpers/functions.database.js'
import type { EnergyDataFile } from '../types/recordTypes.js'

interface GetEnergyDataFilesFilters {
  isPending?: boolean
  isProcessed?: boolean
  isFailed?: boolean
  searchString?: string
  systemFolderPath?: string
}

interface GetEnergyDataFilesOptions {
  limit: number | -1
  includeSystemFileAndFolder: boolean
  includeAssetDetails: boolean
  includeDeletedRecords?: boolean
}

function buildWhereClause(filters: GetEnergyDataFilesFilters): {
  sqlWhereClause: string
  sqlParameters: unknown[]
} {
  let sqlWhereClause = ''
  const sqlParameters: unknown[] = []

  if ((filters.isPending ?? '') !== '') {
    sqlWhereClause += ' and f.isPending = ?'

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    sqlParameters.push(filters.isPending ? 1 : 0)
  }

  if ((filters.isProcessed ?? '') !== '') {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    sqlWhereClause += filters.isProcessed
      ? ' and f.processedTimeMillis is not null'
      : ' and f.processedTimeMillis is null'
  }

  if ((filters.isFailed ?? '') !== '') {
    sqlWhereClause += ' and f.isFailed = ?'

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    sqlParameters.push(filters.isFailed ? 1 : 0)
  }

  if ((filters.searchString ?? '') !== '') {
    sqlWhereClause += ' and (instr(f.originalFileName, ?) > 0)'
    sqlParameters.push(filters.searchString)
  }

  if ((filters.systemFolderPath ?? '') !== '') {
    sqlWhereClause += ' and f.systemFolderPath = ?'
    sqlParameters.push(filters.systemFolderPath)
  }

  return {
    sqlWhereClause,
    sqlParameters
  }
}

export async function getEnergyDataFiles(
  filters: GetEnergyDataFilesFilters,
  options: GetEnergyDataFilesOptions,
  connectedEmileDB?: sqlite.Database
): Promise<EnergyDataFile[]> {
  const groupByColumnNames = `f.fileId, f.originalFileName,
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
    f.recordCreate_timeMillis, f.recordUpdate_timeMillis`

  const { sqlParameters, sqlWhereClause } = buildWhereClause(filters)

  const sql = `select ${groupByColumnNames},
    ${
      filters.isProcessed ?? false
        ? `count(d.dataId) as energyDataCount,
            count(distinct d.assetId) as assetIdCount,
            min(d.timeSeconds) as timeSecondsMin,
            max(d.endTimeSeconds) as endTimeSecondsMax`
        : ' 0 as energyDataCount, 0 as assetIdCount, null as timeSecondsMin, null as endTimeSecondsMax'
    }
    from EnergyDataFiles f
    ${
      options.includeAssetDetails
        ? ` left join Assets a on f.assetId = a.assetId
            left join AssetCategories c on a.categoryId = c.categoryId`
        : ''
    }
    ${
      filters.isProcessed ?? false
        ? ' left join EnergyData d on f.fileId = d.fileId and d.recordDelete_timeMillis is null'
        : ''
    }
    where ${
      options.includeDeletedRecords ?? false
        ? ' 1 = 1'
        : 'f.recordDelete_timeMillis is null'
    }
    ${sqlWhereClause}
    group by ${groupByColumnNames}`

  let orderBy = ' order by recordUpdate_timeMillis desc'

  if (options.limit !== -1) {
    orderBy += ` limit ${options.limit}`
  }

  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true))

  const tempTableName = getTempTableName()

  emileDB
    .prepare(`create temp table ${tempTableName} as ${sql}`)
    .run(sqlParameters)

  const dataFiles = emileDB
    .prepare(`select * from ${tempTableName} ${orderBy}`)
    .all() as EnergyDataFile[]

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  for (const dataFile of dataFiles) {
    if (
      dataFile.parserPropertiesJson !== undefined &&
      dataFile.parserPropertiesJson !== null
    ) {
      dataFile.parserProperties = JSON.parse(dataFile.parserPropertiesJson)
    }

    delete dataFile.parserPropertiesJson
  }

  return dataFiles
}

export async function getPendingEnergyDataFiles(): Promise<EnergyDataFile[]> {
  return await getEnergyDataFiles(
    {
      isPending: true,
      isProcessed: false
    },
    {
      includeAssetDetails: true,
      includeSystemFileAndFolder: false,
      limit: -1
    }
  )
}

export async function getFailedEnergyDataFiles(): Promise<EnergyDataFile[]> {
  return await getEnergyDataFiles(
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

export async function getProcessedEnergyDataFiles(
  searchString?: ''
): Promise<EnergyDataFile[]> {
  return await getEnergyDataFiles(
    {
      isProcessed: true,
      searchString
    },
    {
      includeAssetDetails: true,
      includeSystemFileAndFolder: false,
      limit: 100
    }
  )
}

export async function getEnergyDataFilesToProcess(
  connectedEmileDB
): Promise<EnergyDataFile[]> {
  return await getEnergyDataFiles(
    {
      isPending: false,
      isProcessed: false
    },
    {
      includeAssetDetails: false,
      includeSystemFileAndFolder: true,
      limit: -1
    },
    connectedEmileDB
  )
}
