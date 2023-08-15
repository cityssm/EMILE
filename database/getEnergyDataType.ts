// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/functions.database.js'
import type { EnergyDataType } from '../types/recordTypes.js'

import { addEnergyDataType } from './addEnergyDataType.js'
import { getEnergyAccumulationBehaviourByGreenButtonId } from './getEnergyAccumulationBehaviour.js'
import { getEnergyCommodityByGreenButtonId } from './getEnergyCommodity.js'
import { getEnergyReadingTypeByGreenButtonId } from './getEnergyReadingType.js'
import { getEnergyServiceCategoryByGreenButtonId } from './getEnergyServiceCategory.js'
import { getEnergyUnitByGreenButtonId } from './getEnergyUnit.js'

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
      `select t.dateTypeId,
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

export function getEnergyDataTypeByGreenButtonIds(
  greenButtonIds: {
    serviceCategoryId: string
    unitId: string
    readingTypeId: string
    commodityId: string
    accumulationBehaviourId: string
  },
  sessionUser: EmileUser,
  createIfUnavailable = true
): EnergyDataType | undefined {
  const emileDB = sqlite(databasePath)

  let energyDataType = emileDB
    .prepare(
      `select t.dateTypeId,
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
          and u.greenButtonId = ?
          and r.greenButtonId = ?
          and c.greenButtonId = ?
          and a.greenButtonId = ?`
    )
    .get(
      greenButtonIds.serviceCategoryId,
      greenButtonIds.unitId,
      greenButtonIds.readingTypeId,
      greenButtonIds.commodityId,
      greenButtonIds.accumulationBehaviourId
    ) as EnergyDataType | undefined

  if (energyDataType === undefined && createIfUnavailable) {
    const serviceCategory = getEnergyServiceCategoryByGreenButtonId(
      greenButtonIds.serviceCategoryId,
      emileDB
    )
    const unit = getEnergyUnitByGreenButtonId(greenButtonIds.unitId, emileDB)
    const readingType = getEnergyReadingTypeByGreenButtonId(
      greenButtonIds.readingTypeId,
      emileDB
    )
    const commodity = getEnergyCommodityByGreenButtonId(
      greenButtonIds.commodityId,
      emileDB
    )
    const accumulationBehaviour = getEnergyAccumulationBehaviourByGreenButtonId(
      greenButtonIds.accumulationBehaviourId
    )

    if (
      serviceCategory === undefined ||
      unit === undefined ||
      readingType === undefined ||
      commodity === undefined ||
      accumulationBehaviour === undefined
    ) {
      emileDB.close()
      return undefined
    }

    const dataTypeId = addEnergyDataType(
      {
        serviceCategoryId: serviceCategory.serviceCategoryId,
        unitId: unit.unitId,
        readingTypeId: readingType.readingTypeId,
        commodityId: commodity.commodityId,
        accumulationBehaviourId: accumulationBehaviour.accumulationBehaviourId
      },
      sessionUser,
      emileDB
    )

    energyDataType = getEnergyDataType(dataTypeId, emileDB)
  }

  emileDB.close()

  return energyDataType
}
