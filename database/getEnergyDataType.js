import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
import { addEnergyDataType } from './addEnergyDataType.js';
import { getEnergyAccumulationBehaviourByGreenButtonId, getEnergyAccumulationBehaviourByName } from './getEnergyAccumulationBehaviour.js';
import { getEnergyCommodityByGreenButtonId, getEnergyCommodityByName } from './getEnergyCommodity.js';
import { getEnergyReadingTypeByGreenButtonId, getEnergyReadingTypeByName } from './getEnergyReadingType.js';
import { getEnergyServiceCategoryByGreenButtonId, getEnergyServiceCategoryByName } from './getEnergyServiceCategory.js';
import { getEnergyUnitByGreenButtonId, getEnergyUnitByName } from './getEnergyUnit.js';
export function getEnergyDataType(dataTypeId, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined
        ? sqlite(databasePath, {
            readonly: true
        })
        : connectedEmileDB;
    const energyDataType = emileDB
        .prepare(`select t.dataTypeId,
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
          and t.dataTypeId = ?`)
        .get(dataTypeId);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return energyDataType;
}
export function getEnergyDataTypeByGreenButtonIds(greenButtonIds, sessionUser, createIfUnavailable = true, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB;
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
      and u.greenButtonId = ?`;
    const sqlParameters = [
        greenButtonIds.serviceCategoryId,
        greenButtonIds.unitId
    ];
    if (greenButtonIds.readingTypeId !== undefined) {
        sql += ' and r.greenButtonId = ?';
        sqlParameters.push(greenButtonIds.readingTypeId);
    }
    if (greenButtonIds.commodityId !== undefined) {
        sql += ' and c.greenButtonId = ?';
        sqlParameters.push(greenButtonIds.commodityId);
    }
    if (greenButtonIds.accumulationBehaviourId !== undefined) {
        sql += ' and a.greenButtonId = ?';
        sqlParameters.push(greenButtonIds.accumulationBehaviourId);
    }
    let energyDataType = emileDB.prepare(sql).get(sqlParameters);
    if (energyDataType === undefined && createIfUnavailable) {
        const serviceCategory = getEnergyServiceCategoryByGreenButtonId(greenButtonIds.serviceCategoryId, emileDB);
        const unit = getEnergyUnitByGreenButtonId(greenButtonIds.unitId, emileDB);
        const readingType = greenButtonIds.readingTypeId === undefined
            ? undefined
            : getEnergyReadingTypeByGreenButtonId(greenButtonIds.readingTypeId, emileDB);
        const commodity = greenButtonIds.commodityId === undefined
            ? undefined
            : getEnergyCommodityByGreenButtonId(greenButtonIds.commodityId, emileDB);
        const accumulationBehaviour = greenButtonIds.accumulationBehaviourId === undefined
            ? undefined
            : getEnergyAccumulationBehaviourByGreenButtonId(greenButtonIds.accumulationBehaviourId);
        if (serviceCategory === undefined ||
            unit === undefined ||
            (readingType === undefined &&
                greenButtonIds.readingTypeId !== undefined) ||
            (commodity === undefined && greenButtonIds.commodityId !== undefined) ||
            (accumulationBehaviour === undefined &&
                greenButtonIds.accumulationBehaviourId !== undefined)) {
            emileDB.close();
            return undefined;
        }
        const dataTypeId = addEnergyDataType({
            serviceCategoryId: serviceCategory.serviceCategoryId,
            unitId: unit.unitId,
            readingTypeId: readingType?.readingTypeId,
            commodityId: commodity?.commodityId,
            accumulationBehaviourId: accumulationBehaviour?.accumulationBehaviourId
        }, sessionUser, emileDB);
        energyDataType = getEnergyDataType(dataTypeId, emileDB);
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return energyDataType;
}
export function getEnergyDataTypeByNames(names, sessionUser, createIfUnavailable = true, connectedEmileDB) {
    const emileDB = connectedEmileDB === undefined ? sqlite(databasePath) : connectedEmileDB;
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
      and (u.unit = ? or u.unitLong = ?)`;
    const sqlParameters = [
        names.serviceCategory,
        names.unit,
        names.unit
    ];
    if (names.readingType !== '') {
        sql += ' and r.readingType = ?';
        sqlParameters.push(names.readingType);
    }
    if (names.commodity !== '') {
        sql += ' and c.commodity = ?';
        sqlParameters.push(names.commodity);
    }
    if (names.accumulationBehaviour !== '') {
        sql += ' and a.accumulationBehaviour = ?';
        sqlParameters.push(names.accumulationBehaviour);
    }
    let energyDataType = emileDB.prepare(sql).get(sqlParameters);
    if (energyDataType === undefined && createIfUnavailable) {
        const serviceCategory = getEnergyServiceCategoryByName(names.serviceCategory, emileDB);
        const unit = getEnergyUnitByName(names.unit, emileDB);
        const readingType = names.readingType === ''
            ? undefined
            : getEnergyReadingTypeByName(names.readingType, emileDB);
        const commodity = names.commodity === ''
            ? undefined
            : getEnergyCommodityByName(names.commodity, emileDB);
        const accumulationBehaviour = names.accumulationBehaviour === ''
            ? undefined
            : getEnergyAccumulationBehaviourByName(names.accumulationBehaviour);
        if (serviceCategory === undefined ||
            unit === undefined ||
            (readingType === undefined && names.readingType !== '') ||
            (commodity === undefined && names.commodity !== '') ||
            (accumulationBehaviour === undefined &&
                names.accumulationBehaviour !== '')) {
            if (connectedEmileDB === undefined) {
                emileDB.close();
            }
            return undefined;
        }
        const dataTypeId = addEnergyDataType({
            serviceCategoryId: serviceCategory.serviceCategoryId,
            unitId: unit.unitId,
            readingTypeId: readingType?.readingTypeId,
            commodityId: commodity?.commodityId,
            accumulationBehaviourId: accumulationBehaviour?.accumulationBehaviourId
        }, sessionUser, emileDB);
        energyDataType = getEnergyDataType(dataTypeId, emileDB);
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return energyDataType;
}
