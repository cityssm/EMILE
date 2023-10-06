// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'
import NodeCache from 'node-cache'

import {
  databasePath,
  getConnectionWhenAvailable
} from '../helpers/functions.database.js'
import type { EnergyDataType } from '../types/recordTypes.js'

import { addEnergyDataType } from './addEnergyDataType.js'
import {
  getEnergyAccumulationBehaviourByGreenButtonId,
  getEnergyAccumulationBehaviourByName
} from './getEnergyAccumulationBehaviour.js'
import {
  getEnergyCommodityByGreenButtonId,
  getEnergyCommodityByName
} from './getEnergyCommodity.js'
import {
  getEnergyReadingTypeByGreenButtonId,
  getEnergyReadingTypeByName
} from './getEnergyReadingType.js'
import {
  getEnergyServiceCategoryByGreenButtonId,
  getEnergyServiceCategoryByName
} from './getEnergyServiceCategory.js'
import {
  getEnergyUnitByGreenButtonId,
  getEnergyUnitByName
} from './getEnergyUnit.js'

export function getEnergyDataType(
  dataTypeId: number | string,
  connectedEmileDB?: sqlite.Database
): EnergyDataType | undefined {
  const emileDB =
    connectedEmileDB === undefined
      ? sqlite(databasePath, {
          readonly: true
        })
      : connectedEmileDB

  const energyDataType = emileDB
    .prepare(
      `select t.dataTypeId,
          t.serviceCategoryId, s.serviceCategory,
          t.unitId, u.unit, u.unitLong,
          t.readingTypeId, r.readingType,
          t.commodityId, c.commodity,
          t.accumulationBehaviourId, a.accumulationBehaviour
        from EnergyDataTypes t
        left join EnergyServiceCategories s
          on t.serviceCategoryId = s.serviceCategoryId
        left join EnergyUnits u
          on t.unitId = u.unitId
        left join EnergyReadingTypes r
          on t.readingTypeId = r.readingTypeId
        left join EnergyCommodities c
          on t.commodityId = c.commodityId
        left join EnergyAccumulationBehaviours a
          on t.accumulationBehaviourId = a.accumulationBehaviourId
        where t.recordDelete_timeMillis is null
          and t.dataTypeId = ?`
    )
    .get(dataTypeId) as EnergyDataType | undefined

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return energyDataType
}

interface EnergyDataTypeGreenButtonIds {
  serviceCategoryId: string
  unitId: string
  readingTypeId?: string
  commodityId?: string
  accumulationBehaviourId?: string
}

const energyDataTypeByGreenButtonCache = new NodeCache({
  stdTTL: 60
})

function getEnergyDataTypeByGreenButtonCacheKey(
  greenButtonIds: EnergyDataTypeGreenButtonIds
): string {
  return `${greenButtonIds.serviceCategoryId}:${greenButtonIds.unitId}:${
    greenButtonIds.readingTypeId ?? ''
  }:${greenButtonIds.commodityId ?? ''}:${
    greenButtonIds.accumulationBehaviourId ?? ''
  }`
}

interface GetEnergyDataTypeRelatedIdsByGreenButtonIdsReturn {
  serviceCategoryId: number
  unitId: number
  readingTypeId?: number
  commodityId?: number
  accumulationBehaviourId?: number
}

function getEnergyDataTypeRelatedIdsByGreenButtonIds(
  greenButtonIds: EnergyDataTypeGreenButtonIds,
  emileDB: sqlite.Database
): GetEnergyDataTypeRelatedIdsByGreenButtonIdsReturn {
  /*
   * Service Category - required
   */

  const serviceCategory = getEnergyServiceCategoryByGreenButtonId(
    greenButtonIds.serviceCategoryId,
    emileDB
  )

  if (serviceCategory === undefined) {
    throw new Error(
      `EnergyServiceCategory unavailable by greenButtonId = ${greenButtonIds.serviceCategoryId}`
    )
  }

  /*
   * Unit - required
   */

  const unit = getEnergyUnitByGreenButtonId(greenButtonIds.unitId, emileDB)

  if (unit === undefined) {
    throw new Error(
      `EnergyUnit unavailable by greenButtonId = ${greenButtonIds.unitId}`
    )
  }

  const returnObject: GetEnergyDataTypeRelatedIdsByGreenButtonIdsReturn = {
    serviceCategoryId: serviceCategory.serviceCategoryId,
    unitId: unit.unitId
  }

  /*
   * Reading Type - optional
   */

  if (greenButtonIds.readingTypeId !== undefined) {
    const readingType = getEnergyReadingTypeByGreenButtonId(
      greenButtonIds.readingTypeId,
      emileDB
    )

    if (readingType === undefined) {
      throw new Error(
        `EnergyReadingType unavailable by greenButtonId = ${greenButtonIds.readingTypeId}`
      )
    }

    returnObject.readingTypeId = readingType.readingTypeId
  }

  /*
   * Commodity - optional
   */

  if (greenButtonIds.commodityId !== undefined) {
    const commodity = getEnergyCommodityByGreenButtonId(
      greenButtonIds.commodityId,
      emileDB
    )

    if (commodity === undefined) {
      throw new Error(
        `EnergyCommodity unavailable by greenButtonId = ${greenButtonIds.commodityId}`
      )
    }

    returnObject.commodityId = commodity.commodityId
  }

  /*
   * Accumulation Behaviour - optional
   */

  if (greenButtonIds.accumulationBehaviourId !== undefined) {
    const accumulationBehaviour = getEnergyAccumulationBehaviourByGreenButtonId(
      greenButtonIds.accumulationBehaviourId
    )

    if (accumulationBehaviour === undefined) {
      throw new Error(
        `EnergyAccumulationBehaviour unavailable by greenButtonId = ${greenButtonIds.accumulationBehaviourId}`
      )
    }

    returnObject.accumulationBehaviourId =
      accumulationBehaviour.accumulationBehaviourId
  }

  return returnObject
}

export async function getEnergyDataTypeByGreenButtonIds(
  greenButtonIds: EnergyDataTypeGreenButtonIds,
  sessionUser: EmileUser,
  createIfUnavailable = true,
  connectedEmileDB?: sqlite.Database
): Promise<EnergyDataType | undefined> {
  const energyDataTypeByGreenButtonCacheKey =
    getEnergyDataTypeByGreenButtonCacheKey(greenButtonIds)

  let energyDataType = energyDataTypeByGreenButtonCache.get<EnergyDataType>(
    energyDataTypeByGreenButtonCacheKey
  )

  if (energyDataType !== undefined) {
    return energyDataType
  }

  const emileDB =
    connectedEmileDB === undefined
      ? await getConnectionWhenAvailable()
      : connectedEmileDB

  let sql = `select t.dataTypeId,
      t.serviceCategoryId, s.serviceCategory,
      t.unitId, u.unit, u.unitLong,
      t.readingTypeId, r.readingType,
      t.commodityId, c.commodity,
      t.accumulationBehaviourId, a.accumulationBehaviour
    from EnergyDataTypes t
    left join EnergyServiceCategories s
      on t.serviceCategoryId = s.serviceCategoryId
    left join EnergyUnits u
      on t.unitId = u.unitId
    left join EnergyReadingTypes r
      on t.readingTypeId = r.readingTypeId
    left join EnergyCommodities c
      on t.commodityId = c.commodityId
    left join EnergyAccumulationBehaviours a
      on t.accumulationBehaviourId = a.accumulationBehaviourId
    where t.recordDelete_timeMillis is null
      and s.greenButtonId = ?
      and u.greenButtonId = ?`

  const sqlParameters: unknown[] = [
    greenButtonIds.serviceCategoryId,
    greenButtonIds.unitId
  ]

  if (greenButtonIds.readingTypeId === undefined) {
    sql += ' and t.readingTypeId is null'
  } else {
    sql += ' and r.greenButtonId = ?'
    sqlParameters.push(greenButtonIds.readingTypeId)
  }

  if (greenButtonIds.commodityId === undefined) {
    sql += ' and t.commodityId is null'
  } else {
    sql += ' and c.greenButtonId = ?'
    sqlParameters.push(greenButtonIds.commodityId)
  }

  if (greenButtonIds.accumulationBehaviourId === undefined) {
    sql += ' and t.accumulationBehaviourId is null'
  } else {
    sql += ' and a.greenButtonId = ?'
    sqlParameters.push(greenButtonIds.accumulationBehaviourId)
  }

  energyDataType = emileDB.prepare(sql).get(sqlParameters) as
    | EnergyDataType
    | undefined

  if (energyDataType === undefined && createIfUnavailable) {
    try {
      const relatedIds = getEnergyDataTypeRelatedIdsByGreenButtonIds(
        greenButtonIds,
        emileDB
      )

      const dataTypeId = addEnergyDataType(
        {
          serviceCategoryId: relatedIds.serviceCategoryId,
          unitId: relatedIds.unitId,
          readingTypeId: relatedIds.readingTypeId,
          commodityId: relatedIds.commodityId,
          accumulationBehaviourId: relatedIds.accumulationBehaviourId
        },
        sessionUser,
        emileDB
      )

      energyDataType = getEnergyDataType(dataTypeId, emileDB)
    } catch {
      return undefined
    } finally {
      emileDB.close()
    }
  }

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  energyDataTypeByGreenButtonCache.set(
    energyDataTypeByGreenButtonCacheKey,
    energyDataType
  )

  return energyDataType
}

export function getEnergyDataTypeByNames(
  names: {
    serviceCategory: string
    unit: string
    readingType: string | ''
    commodity: string | ''
    accumulationBehaviour: string | ''
  },
  sessionUser: EmileUser,
  createIfUnavailable = true,
  connectedEmileDB?: sqlite.Database
): EnergyDataType | undefined {
  const emileDB =
    connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB

  let sql = `select t.dataTypeId,
      t.serviceCategoryId, s.serviceCategory,
      t.unitId, u.unit, u.unitLong,
      t.readingTypeId, r.readingType,
      t.commodityId, c.commodity,
      t.accumulationBehaviourId, a.accumulationBehaviour
    from EnergyDataTypes t
    left join EnergyServiceCategories s
      on t.serviceCategoryId = s.serviceCategoryId
    left join EnergyUnits u
      on t.unitId = u.unitId
    left join EnergyReadingTypes r
      on t.readingTypeId = r.readingTypeId
    left join EnergyCommodities c
      on t.commodityId = c.commodityId
    left join EnergyAccumulationBehaviours a
      on t.accumulationBehaviourId = a.accumulationBehaviourId
    where t.recordDelete_timeMillis is null
      and s.serviceCategory = ?
      and (u.unit = ? or u.unitLong = ?)`

  const sqlParameters: unknown[] = [
    names.serviceCategory,
    names.unit,
    names.unit
  ]

  if (names.readingType === '') {
    sql += " and (t.readingTypeId is null or r.readingType = '')"
  } else {
    sql += ' and r.readingType = ?'
    sqlParameters.push(names.readingType)
  }

  if (names.commodity === '') {
    sql += " and (t.commodityId is null or c.commodity = '')"
  } else {
    sql += ' and c.commodity = ?'
    sqlParameters.push(names.commodity)
  }

  if (names.accumulationBehaviour === '') {
    sql +=
      " and (a.accumulationBehaviourId is null or a.accumulationBehaviour = '')"
  } else {
    sql += ' and a.accumulationBehaviour = ?'
    sqlParameters.push(names.accumulationBehaviour)
  }

  let energyDataType = emileDB.prepare(sql).get(sqlParameters) as
    | EnergyDataType
    | undefined

  if (energyDataType === undefined && createIfUnavailable) {
    const serviceCategory = getEnergyServiceCategoryByName(
      names.serviceCategory,
      emileDB
    )

    const unit = getEnergyUnitByName(names.unit, emileDB)

    const readingType =
      names.readingType === ''
        ? undefined
        : getEnergyReadingTypeByName(names.readingType, emileDB)

    const commodity =
      names.commodity === ''
        ? undefined
        : getEnergyCommodityByName(names.commodity, emileDB)

    const accumulationBehaviour =
      names.accumulationBehaviour === ''
        ? undefined
        : getEnergyAccumulationBehaviourByName(names.accumulationBehaviour)

    if (
      serviceCategory === undefined ||
      unit === undefined ||
      (readingType === undefined && names.readingType !== '') ||
      (commodity === undefined && names.commodity !== '') ||
      (accumulationBehaviour === undefined &&
        names.accumulationBehaviour !== '')
    ) {
      if (connectedEmileDB === undefined) {
        emileDB.close()
      }

      return undefined
    }

    const dataTypeId = addEnergyDataType(
      {
        serviceCategoryId: serviceCategory.serviceCategoryId,
        unitId: unit.unitId,
        readingTypeId: readingType?.readingTypeId,
        commodityId: commodity?.commodityId,
        accumulationBehaviourId: accumulationBehaviour?.accumulationBehaviourId
      },
      sessionUser,
      emileDB
    )

    energyDataType = getEnergyDataType(dataTypeId, emileDB)
  }

  if (connectedEmileDB === undefined) {
    emileDB.close()
  }

  return energyDataType
}
