// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type sqlite from 'better-sqlite3'

import { getConnectionWhenAvailable } from '../helpers/functions.database.js'

import { recordColumns } from './initializeDatabase.js'

export const energyDataTablePrefix = 'EnergyData_AssetId_'

type RawEnergyTableNameFormat = `${typeof energyDataTablePrefix}${number}`
type DailyEnergyTableNameFormat =
  `${typeof energyDataTablePrefix}${number}_Daily`
type MonthlyEnergyTableNameFormat =
  `${typeof energyDataTablePrefix}${number}_Monthly`

type EnergyDataTableNameFormat =
  | RawEnergyTableNameFormat
  | DailyEnergyTableNameFormat
  | MonthlyEnergyTableNameFormat

let energyDataTableNames = new Set<EnergyDataTableNameFormat>()

interface TableNames {
  raw: RawEnergyTableNameFormat
  daily: DailyEnergyTableNameFormat
  monthly: MonthlyEnergyTableNameFormat
}

export function getEnergyDataTableNames(assetId: number | string): TableNames {
  const tableName =
    `${energyDataTablePrefix}${assetId}` as RawEnergyTableNameFormat

  return {
    raw: tableName,
    daily: `${tableName}_Daily`,
    monthly: `${tableName}_Monthly`
  }
}

function getAggregationSql(
  assetId: number | string,
  aggregation: 'daily' | 'monthly'
): string {
  const dateTimeSubstringSize = aggregation === 'daily' ? '11' : '8'

  return `select
    min(dataId) as dataIdMin,
    count(dataId) as dataCount,
    assetId, dataTypeId,

    substring(datetime(timeSeconds, 'unixepoch', 'localtime'), 0, ${dateTimeSubstringSize}) as timeString,

    min(timeSeconds) as timeSeconds,
    max(endTimeSeconds) - min(timeSeconds) as durationSeconds,
    max(endTimeSeconds) as endTimeSeconds,

    sum(dataValue * pow(10, powerOfTenMultiplier)) as dataValueSum,
    min(dataValue * pow(10, powerOfTenMultiplier)) as dataValueMin,
    max(dataValue * pow(10, powerOfTenMultiplier)) as dataValueMax,

    min(recordCreate_timeMillis) as recordCreate_timeMillisMin,
    max(recordCreate_timeMillis) as recordCreate_timeMillisMax,

    min(recordUpdate_timeMillis) as recordUpdate_timeMillisMin,
    max(recordUpdate_timeMillis) as recordUpdate_timeMillisMax

    from EnergyData_AssetId_${assetId}

    where recordDelete_timeMillis is null

    group by assetId, dataTypeId, substring(datetime(timeSeconds, 'unixepoch', 'localtime'), 0, ${dateTimeSubstringSize})`
}

export function refreshAggregatedEnergyDataTables(
  assetId: number | string,
  emileDB: sqlite.Database
): void {
  const tableNames = getEnergyDataTableNames(assetId)

  for (const [tableType, tableName] of Object.entries(tableNames)) {
    if (tableType === 'raw') {
      continue
    }

    emileDB.prepare(`delete from ${tableName}`).run()

    emileDB
      .prepare(
        `insert into ${tableName} (
          dataIdMin, dataCount,
          assetId, dataTypeId,
          timeString,
          timeSeconds, durationSeconds, endTimeSeconds,
          dataValueSum, dataValueMin, dataValueMax,
          recordCreate_timeMillisMin, recordCreate_timeMillisMax,
          recordUpdate_timeMillisMin, recordUpdate_timeMillisMax)
          
          ${getAggregationSql(assetId, tableType as 'daily' | 'monthly')}`
      )
      .run()
  }
}

/**
 * Includes raw and aggregate tables
 * @param connectedEmileDB
 * @returns
 */
export async function reloadEnergyDataTableNames(
  connectedEmileDB?: sqlite.Database
): Promise<Set<EnergyDataTableNameFormat>> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  const energyDataTableNamesResult = emileDB
    .prepare(
      `select name from sqlite_master
        where type = 'table'
        and name like '${energyDataTablePrefix}%'`
    )
    .pluck()
    .all() as EnergyDataTableNameFormat[]

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  energyDataTableNames = new Set(energyDataTableNamesResult)

  return energyDataTableNames
}

export async function refreshEnergyDataTableViews(
  emileDB: sqlite.Database
): Promise<void> {
  await reloadEnergyDataTableNames(emileDB)

  emileDB.prepare('drop view if exists EnergyData').run()
  emileDB.prepare('drop view if exists EnergyData_Daily').run()
  emileDB.prepare('drop view if exists EnergyData_Monthly').run()

  let createRawViewSql = ''
  let createDailyViewSql = ''
  let createMonthlyViewSql = ''

  if (energyDataTableNames.size === 0) {
    createRawViewSql = `create view if not exists EnergyData as
      select 0 as dataId,
      0 as assetId,
      0 as dataTypeId,
      0 as fileId,
      0 as timeSeconds,
      0 as durationSeconds,
      0 as endTimeSeconds,
      0 as dataValue,
      0 as powerOfTenMultiplier,
      'system.init' as recordCreate_userName,
      0 as recordCreate_timeMillis,
      'system.init' as recordUpdate_userName,
      0 as recordUpdate_timeMillis,
      'system.init' as recordDelete_userName,
      0 as recordDelete_timeMillis
    `

    createDailyViewSql = `create view if not exists EnergyData_Daily as
      select 0 as dataIdMin,
      0 as dataCount,
      0 as assetId,
      0 as dataTypeId,
      '' as timeString,
      0 as timeSeconds,
      0 as durationSeconds,
      0 as endTimeSeconds,
      0 as dataValueSum,
      0 as dataValueMin,
      0 as dataValueMax,
      0 as recordCreate_timeMillisMin,
      0 as recordCreate_timeMillisMax,
      0 as recordUpdate_timeMillisMin,
      0 as recordUpdate_timeMillisMax
    `

    createMonthlyViewSql = `create view if not exists EnergyData_Monthly as
      select 0 as dataIdMin,
      0 as dataCount,
      0 as assetId,
      0 as dataTypeId,
      '' as timeString,
      0 as timeSeconds,
      0 as durationSeconds,
      0 as endTimeSeconds,
      0 as dataValueSum,
      0 as dataValueMin,
      0 as dataValueMax,
      0 as recordCreate_timeMillisMin,
      0 as recordCreate_timeMillisMax,
      0 as recordUpdate_timeMillisMin,
      0 as recordUpdate_timeMillisMax
    `
  } else {
    const selectStatements: {
      raw: string[]
      daily: string[]
      monthly: string[]
    } = {
      raw: [],
      daily: [],
      monthly: []
    }

    for (const tableName of energyDataTableNames) {
      if (tableName.endsWith('_Daily') || tableName.endsWith('_Monthly')) {
        selectStatements[tableName.endsWith('_Daily') ? 'daily' : 'monthly']
          .push(`select dataIdMin, dataCount,
            assetId, dataTypeId,
            timeString, timeSeconds, durationSeconds, endTimeSeconds,
            dataValueSum, dataValueMin, dataValueMax,
            recordCreate_timeMillisMin, recordCreate_timeMillisMax,
            recordUpdate_timeMillisMin, recordUpdate_timeMillisMax
            from ${tableName}`)
      } else {
        selectStatements.raw.push(`select dataId, assetId, dataTypeId, fileId,
          timeSeconds, durationSeconds, endTimeSeconds,
          dataValue, powerOfTenMultiplier,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis,
          recordDelete_userName, recordDelete_timeMillis
          from ${tableName}
          where recordDelete_timeMillis is null`)
      }
    }

    createRawViewSql = `create view if not exists EnergyData as
      ${selectStatements.raw.join(' union ')}`

    createDailyViewSql = `create view if not exists EnergyData_Daily as
      ${selectStatements.daily.join(' union ')}`

    createMonthlyViewSql = `create view if not exists EnergyData_Monthly as
      ${selectStatements.monthly.join(' union ')}`
  }

  emileDB.prepare(createRawViewSql).run()
  emileDB.prepare(createDailyViewSql).run()
  emileDB.prepare(createMonthlyViewSql).run()
}

export async function ensureEnergyDataTablesExists(
  assetId: number | string,
  connectedEmileDB?: sqlite.Database
): Promise<{
  raw: string
  daily: string
  monthly: string
}> {
  if (energyDataTableNames.size === 0) {
    await reloadEnergyDataTableNames(connectedEmileDB)
  }

  const tableNames = getEnergyDataTableNames(assetId)

  if (
    energyDataTableNames.has(tableNames.raw) &&
    energyDataTableNames.has(tableNames.daily) &&
    energyDataTableNames.has(tableNames.monthly)
  ) {
    return tableNames
  }

  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  for (const [tableType, tableName] of Object.entries(tableNames)) {
    const createTableSql =
      tableType === 'raw'
        ? `create table if not exists ${tableName} (
            dataId integer primary key autoincrement,
            assetId integer not null references Assets (assetId) check (assetId = ${assetId}),
            dataTypeId integer not null references EnergyDataTypes (dataTypeId),
            fileId integer references EnergyDataFiles (fileId),
            timeSeconds integer not null check (timeSeconds > 0),
            durationSeconds integer not null check (durationSeconds > 0),
            endTimeSeconds integer not null generated always as (timeSeconds + durationSeconds) virtual,
            dataValue decimal(10, 2) not null,
            powerOfTenMultiplier integer not null default 0,
            ${recordColumns}
            )`
        : `create table if not exists ${tableName} (
            dataIdMin integer primary key not null,
            dataCount integer not null check (dataCount > 0),
            assetId integer not null references Assets (assetId) check (assetId = ${assetId}),
            dataTypeId integer not null references EnergyDataTypes (dataTypeId),

            timeString varchar(10) not null,
            timeSeconds integer not null check (timeSeconds > 0),
            durationSeconds integer not null check (durationSeconds > 0),
            endTimeSeconds integer not null check (endTimeSeconds > 0),

            dataValueSum decimal(10, 2) not null,
            dataValueMin decimal(10, 2) not null,
            dataValueMax decimal(10, 2) not null,

            recordCreate_timeMillisMin integer not null,
            recordCreate_timeMillisMax integer not null,
            recordUpdate_timeMillisMin integer not null,
            recordUpdate_timeMillisMax integer not null
            )`

    emileDB.prepare(createTableSql).run()

    emileDB
      .prepare(
        `create index if not exists idx_${tableName} on ${tableName}
          (timeSeconds, dataTypeId)
          ${tableName === 'raw' ? 'where recordDelete_timeMillis is null' : ''}`
      )
      .run()
  }

  await refreshEnergyDataTableViews(emileDB)
  refreshAggregatedEnergyDataTables(assetId, emileDB)

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return tableNames
}
