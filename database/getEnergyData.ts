// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-nested-ternary */

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import { powerOfTenMultipliers } from '@cityssm/green-button-parser/lookups.js'
import { dateStringToDate } from '@cityssm/utils-datetime'
import type sqlite from 'better-sqlite3'

import {
  getConnectionWhenAvailable,
  getTempTableName
} from '../helpers/functions.database.js'
import type { EnergyData } from '../types/recordTypes.js'

import { ensureEnergyDataTablesExists } from './manageEnergyDataTables.js'

interface GetEnergyDataFilters {
  assetId?: number | string
  categoryId?: number | string
  groupId?: number | string
  dataTypeId?: number | string
  fileId?: number | string
  startDateString?: string
  endDateString?: string
  timeSecondsMin?: number | string
  timeSecondsMax?: number | string
}

interface GetEnergyDataOptions {
  formatForExport?: boolean
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function userFunction_getPowerOfTenMultiplierName(
  powerOfTenMultiplier: number
): string {
  if (powerOfTenMultiplier === 0) {
    return ''
  }

  return (
    powerOfTenMultipliers[powerOfTenMultiplier] ??
    powerOfTenMultiplier.toString()
  )
}

function buildWhereClause(filters: GetEnergyDataFilters): {
  sqlWhereClause: string
  sqlParameters: unknown[]
} {
  let sqlWhereClause = ''
  const sqlParameters: unknown[] = []

  if ((filters.assetId ?? '') !== '') {
    sqlWhereClause += ' and d.assetId = ?'
    sqlParameters.push(filters.assetId)
  }

  if ((filters.categoryId ?? '') !== '') {
    sqlWhereClause += ' and a.categoryId = ?'
    sqlParameters.push(filters.categoryId)
  }

  if ((filters.groupId ?? '') !== '') {
    sqlWhereClause +=
      ' and d.assetId in (select assetId from AssetGroupMembers where recordDelete_timeMillis is null and groupId = ?)'
    sqlParameters.push(filters.groupId)
  }

  if ((filters.dataTypeId ?? '') !== '') {
    sqlWhereClause += ' and d.dataTypeId = ?'
    sqlParameters.push(filters.dataTypeId)
  }

  if ((filters.fileId ?? '') !== '') {
    sqlWhereClause += ' and d.fileId = ?'
    sqlParameters.push(filters.fileId)
  }

  if ((filters.startDateString ?? '') !== '') {
    sqlWhereClause += ' and d.timeSeconds >= ?'

    sqlParameters.push(
      dateStringToDate(filters.startDateString ?? '').getTime() / 1000
    )
  }

  if ((filters.timeSecondsMin ?? '') !== '') {
    sqlWhereClause += ' and d.timeSeconds >= ?'

    sqlParameters.push(filters.timeSecondsMin)
  }

  if ((filters.endDateString ?? '') !== '') {
    sqlWhereClause += ' and d.timeSeconds <= ?'

    const endDate = dateStringToDate(filters.endDateString ?? '')
    endDate.setDate(endDate.getDate() + 1)

    sqlParameters.push(endDate.getTime() / 1000)
  }

  if ((filters.timeSecondsMax ?? '') !== '') {
    sqlWhereClause += ' and d.timeSeconds <= ?'

    sqlParameters.push(filters.timeSecondsMax)
  }

  return {
    sqlWhereClause,
    sqlParameters
  }
}

export async function getEnergyData(
  filters: GetEnergyDataFilters,
  options?: GetEnergyDataOptions
): Promise<EnergyData[]> {
  const useAggregateTables =
    !(options?.formatForExport ?? false) &&
    filters.startDateString !== filters.endDateString

  let columnNames = ''

  if (options?.formatForExport ?? false) {
    columnNames = `d.dataId,
      c.category, a.assetName,
      ts.serviceCategory,
      userFunction_getPowerOfTenMultiplierName(d.powerOfTenMultiplier) as powerOfTenMultiplierName,
      tu.unit,
      tr.readingType,
      tc.commodity,
      ta.accumulationBehaviour,
      datetime(d.timeSeconds, 'unixepoch', 'localtime') as startDateTime,
      d.durationSeconds,
      d.dataValue, d.powerOfTenMultiplier`
  } else if (useAggregateTables) {
    columnNames = `d.dataIdMin as dataId,
      d.assetId, a.assetName,
      c.category, c.fontAwesomeIconClasses,
      d.dataTypeId,
      t.serviceCategoryId, ts.serviceCategory,
      t.unitId, tu.unit, tu.unitLong, tu.preferredPowerOfTenMultiplier,
      '' as powerOfTenMultiplierName,
      userFunction_getPowerOfTenMultiplierName(tu.preferredPowerOfTenMultiplier) as preferredPowerOfTenMultiplierName,
      t.readingTypeId, tr.readingType,
      t.commodityId, tc.commodity,
      t.accumulationBehaviourId, ta.accumulationBehaviour,
      null as fileId,
      null as originalFileName,
      d.timeSeconds,
      d.durationSeconds,
      d.endTimeSeconds,
      dataValueSum as dataValue,
      0 as powerOfTenMultiplier`
  } else {
    columnNames = `d.dataId,
      d.assetId, a.assetName, c.category, c.fontAwesomeIconClasses,
      d.dataTypeId,
      t.serviceCategoryId, ts.serviceCategory,
      t.unitId, tu.unit, tu.unitLong, tu.preferredPowerOfTenMultiplier,
      userFunction_getPowerOfTenMultiplierName(d.powerOfTenMultiplier) as powerOfTenMultiplierName,
      userFunction_getPowerOfTenMultiplierName(tu.preferredPowerOfTenMultiplier) as preferredPowerOfTenMultiplierName,
      t.readingTypeId, tr.readingType,
      t.commodityId, tc.commodity,
      t.accumulationBehaviourId, ta.accumulationBehaviour,
      d.fileId, f.originalFileName,
      d.timeSeconds, d.durationSeconds, d.endTimeSeconds,
      d.dataValue, d.powerOfTenMultiplier`
  }

  const emileDB = await getConnectionWhenAvailable(true)

  let tableName = 'EnergyData'

  if ((filters.assetId ?? '') === '') {
    if (useAggregateTables) {
      tableName = 'EnergyData_Daily'
    }
  } else {
    const assetTableNames = await ensureEnergyDataTablesExists(
      filters.assetId as unknown as string | number,
      emileDB
    )

    tableName = useAggregateTables ? assetTableNames.daily : assetTableNames.raw
  }

  const { sqlParameters, sqlWhereClause } = buildWhereClause(filters)

  const sql = `select ${columnNames}
    from ${tableName} d
    left join Assets a
      on d.assetId = a.assetId
    left join AssetCategories c
      on a.categoryId = c.categoryId
    left join EnergyDataTypes t
      on d.dataTypeId = t.dataTypeId
    left join EnergyServiceCategories ts
      on t.serviceCategoryId = ts.serviceCategoryId
    left join EnergyUnits tu
      on t.unitId = tu.unitId
    left join EnergyReadingTypes tr
      on t.readingTypeId = tr.readingTypeId
    left join EnergyCommodities tc
      on t.commodityId = tc.commodityId
    left join EnergyAccumulationBehaviours ta
      on t.accumulationBehaviourId = ta.accumulationBehaviourId
    ${
      useAggregateTables
        ? ''
        : 'left join EnergyDataFiles f on d.fileId = f.fileId'
    }
    where a.recordDelete_timeMillis is null
      ${useAggregateTables ? '' : ' and d.recordDelete_timeMillis is null'}
      ${sqlWhereClause}`

  const orderBy =
    options?.formatForExport ?? false
      ? ''
      : ' order by assetId, dataTypeId, timeSeconds'

  emileDB.function(
    'userFunction_getPowerOfTenMultiplierName',
    userFunction_getPowerOfTenMultiplierName
  )

  const tempTableName = getTempTableName()

  emileDB
    .prepare(`create temp table ${tempTableName} as ${sql}`)
    .run(sqlParameters)

  const data = emileDB
    .prepare(`select * from ${tempTableName} ${orderBy}`)
    .all() as EnergyData[]

  emileDB.close()

  return data
}

export async function getEnergyDataPoint(
  filters: {
    assetId: number
    dataTypeId: number
    timeSeconds: number
    durationSeconds: number
  },
  connectedEmileDB?: sqlite.Database
): Promise<EnergyData | undefined> {
  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable(true))

  const tableNames = await ensureEnergyDataTablesExists(
    filters.assetId,
    emileDB
  )

  const dataPoint = emileDB
    .prepare(
      `select dataId, assetId, dataTypeId, fileId,
        timeSeconds, durationSeconds, dataValue, powerOfTenMultiplier
        from ${tableNames.raw}
        where recordDelete_timeMillis is null
        and dataTypeId = ?
        and timeSeconds = ?
        and durationSeconds = ?`
    )
    .get(filters.dataTypeId, filters.timeSeconds, filters.durationSeconds) as
    | EnergyData
    | undefined

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return dataPoint
}

export async function getEnergyDataFullyJoined(): Promise<unknown[]> {
  const emileDB = await getConnectionWhenAvailable()

  const tempTableName = getTempTableName()

  const sql = `select d.dataId,
        c.category,
        a.assetName, a.latitude, a.longitude,
        ts.serviceCategory,
        tu.unit, tu.unitLong,
        tr.readingType,
        tc.commodity,
        ta.accumulationBehaviour,
        datetime(d.timeSeconds, 'unixepoch', 'localtime') as startDateTime,
        datetime(d.endTimeSeconds, 'unixepoch', 'localtime') as endDateTime,
      
        d.dataValue * power(10, d.powerOfTenMultiplier) as dataValueEvaluated,
      
        d.dataValue,
        d.powerOfTenMultiplier,
      
        d.recordCreate_userName, d.recordCreate_timeMillis,
        d.recordUpdate_userName, d.recordUpdate_timeMillis,
        a.categoryId, a.assetId, d.dataTypeId, t.serviceCategoryId, t.unitId, t.readingTypeId, t.commodityId, t.accumulationBehaviourId,
        d.timeSeconds, d.durationSeconds
      
      from EnergyData d
      left join Assets a
        on d.assetId = a.assetId
      left join AssetCategories c
        on a.categoryId = c.categoryId
      left join EnergyDataTypes t
        on d.dataTypeId = t.dataTypeId
      left join EnergyServiceCategories ts
        on t.serviceCategoryId = ts.serviceCategoryId
      left join EnergyUnits tu
        on t.unitId = tu.unitId
      left join EnergyReadingTypes tr
        on t.readingTypeId = tr.readingTypeId
      left join EnergyCommodities tc
        on t.commodityId = tc.commodityId
      left join EnergyAccumulationBehaviours ta
        on t.accumulationBehaviourId = ta.accumulationBehaviourId
      left join EnergyDataFiles f
        on d.fileId = f.fileId
      where d.recordDelete_timeMillis is null
        and a.recordDelete_timeMillis is null`

  emileDB.prepare(`create temp table ${tempTableName} as ${sql}`).run()

  return emileDB.prepare(`select * from ${tempTableName}`).raw().all()
}
