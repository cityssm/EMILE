import sqlite from 'better-sqlite3';
import NodeCache from 'node-cache';
import { databasePath, getConnectionWhenAvailable } from '../helpers/functions.database.js';
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
const energyDataTypeByGreenButtonCache = new NodeCache({
    stdTTL: 60
});
function getEnergyDataTypeByGreenButtonCacheKey(greenButtonIds) {
    return `${greenButtonIds.serviceCategoryId}:${greenButtonIds.unitId}:${greenButtonIds.readingTypeId ?? ''}:${greenButtonIds.commodityId ?? ''}:${greenButtonIds.accumulationBehaviourId ?? ''}`;
}
function getEnergyDataTypeRelatedIds(namesOrGreenButtonIds, emileDB) {
    const serviceCategory = namesOrGreenButtonIds.type === 'greenButtonIds'
        ? getEnergyServiceCategoryByGreenButtonId(namesOrGreenButtonIds.serviceCategoryId, emileDB)
        : getEnergyServiceCategoryByName(namesOrGreenButtonIds.serviceCategory, emileDB);
    if (serviceCategory === undefined) {
        throw new Error('EnergyServiceCategory unavailable');
    }
    const unit = namesOrGreenButtonIds.type === 'greenButtonIds'
        ? getEnergyUnitByGreenButtonId(namesOrGreenButtonIds.unitId, emileDB)
        : getEnergyUnitByName(namesOrGreenButtonIds.unit, emileDB);
    if (unit === undefined) {
        throw new Error('EnergyUnit unavailable');
    }
    const returnObject = {
        serviceCategoryId: serviceCategory.serviceCategoryId,
        unitId: unit.unitId
    };
    if ((namesOrGreenButtonIds.type === 'greenButtonIds' &&
        namesOrGreenButtonIds.readingTypeId !== undefined) ||
        (namesOrGreenButtonIds.type === 'names' &&
            namesOrGreenButtonIds.readingType !== '')) {
        const readingType = namesOrGreenButtonIds.type === 'greenButtonIds'
            ? getEnergyReadingTypeByGreenButtonId(namesOrGreenButtonIds.readingTypeId ?? '', emileDB)
            : getEnergyReadingTypeByName(namesOrGreenButtonIds.readingType, emileDB);
        if (readingType === undefined) {
            throw new Error('EnergyReadingType unavailable');
        }
        returnObject.readingTypeId = readingType.readingTypeId;
    }
    if ((namesOrGreenButtonIds.type === 'greenButtonIds' &&
        namesOrGreenButtonIds.commodityId !== undefined) ||
        (namesOrGreenButtonIds.type === 'names' &&
            namesOrGreenButtonIds.commodity !== '')) {
        const commodity = namesOrGreenButtonIds.type === 'greenButtonIds'
            ? getEnergyCommodityByGreenButtonId(namesOrGreenButtonIds.commodityId ?? '', emileDB)
            : getEnergyCommodityByName(namesOrGreenButtonIds.commodity, emileDB);
        if (commodity === undefined) {
            throw new Error('EnergyCommodity unavailable');
        }
        returnObject.commodityId = commodity.commodityId;
    }
    if ((namesOrGreenButtonIds.type === 'greenButtonIds' &&
        namesOrGreenButtonIds.accumulationBehaviourId !== undefined) ||
        (namesOrGreenButtonIds.type === 'names' &&
            namesOrGreenButtonIds.accumulationBehaviour !== '')) {
        const accumulationBehaviour = namesOrGreenButtonIds.type === 'greenButtonIds'
            ? getEnergyAccumulationBehaviourByGreenButtonId(namesOrGreenButtonIds.accumulationBehaviourId ?? '')
            : getEnergyAccumulationBehaviourByName(namesOrGreenButtonIds.accumulationBehaviour);
        if (accumulationBehaviour === undefined) {
            throw new Error('EnergyAccumulationBehaviour unavailable');
        }
        returnObject.accumulationBehaviourId =
            accumulationBehaviour.accumulationBehaviourId;
    }
    return returnObject;
}
export async function getEnergyDataTypeByGreenButtonIds(greenButtonIds, sessionUser, createIfUnavailable = true, connectedEmileDB) {
    const energyDataTypeByGreenButtonCacheKey = getEnergyDataTypeByGreenButtonCacheKey(greenButtonIds);
    let energyDataType = energyDataTypeByGreenButtonCache.get(energyDataTypeByGreenButtonCacheKey);
    if (energyDataType !== undefined) {
        return energyDataType;
    }
    const emileDB = connectedEmileDB === undefined
        ? await getConnectionWhenAvailable()
        : connectedEmileDB;
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
    if (greenButtonIds.readingTypeId === undefined) {
        sql += ' and t.readingTypeId is null';
    }
    else {
        sql += ' and r.greenButtonId = ?';
        sqlParameters.push(greenButtonIds.readingTypeId);
    }
    if (greenButtonIds.commodityId === undefined) {
        sql += ' and t.commodityId is null';
    }
    else {
        sql += ' and c.greenButtonId = ?';
        sqlParameters.push(greenButtonIds.commodityId);
    }
    if (greenButtonIds.accumulationBehaviourId === undefined) {
        sql += ' and t.accumulationBehaviourId is null';
    }
    else {
        sql += ' and a.greenButtonId = ?';
        sqlParameters.push(greenButtonIds.accumulationBehaviourId);
    }
    energyDataType = emileDB.prepare(sql).get(sqlParameters);
    if (energyDataType === undefined && createIfUnavailable) {
        try {
            const relatedIds = getEnergyDataTypeRelatedIds(Object.assign({ type: 'greenButtonIds' }, greenButtonIds), emileDB);
            const dataTypeId = addEnergyDataType({
                serviceCategoryId: relatedIds.serviceCategoryId,
                unitId: relatedIds.unitId,
                readingTypeId: relatedIds.readingTypeId,
                commodityId: relatedIds.commodityId,
                accumulationBehaviourId: relatedIds.accumulationBehaviourId
            }, sessionUser, emileDB);
            energyDataType = getEnergyDataType(dataTypeId, emileDB);
        }
        catch {
            return undefined;
        }
        finally {
            emileDB.close();
        }
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    energyDataTypeByGreenButtonCache.set(energyDataTypeByGreenButtonCacheKey, energyDataType);
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
    if (names.readingType === '') {
        sql += " and (t.readingTypeId is null or r.readingType = '')";
    }
    else {
        sql += ' and r.readingType = ?';
        sqlParameters.push(names.readingType);
    }
    if (names.commodity === '') {
        sql += " and (t.commodityId is null or c.commodity = '')";
    }
    else {
        sql += ' and c.commodity = ?';
        sqlParameters.push(names.commodity);
    }
    if (names.accumulationBehaviour === '') {
        sql +=
            " and (a.accumulationBehaviourId is null or a.accumulationBehaviour = '')";
    }
    else {
        sql += ' and a.accumulationBehaviour = ?';
        sqlParameters.push(names.accumulationBehaviour);
    }
    let energyDataType = emileDB.prepare(sql).get(sqlParameters);
    if (energyDataType === undefined && createIfUnavailable) {
        try {
            const relatedIds = getEnergyDataTypeRelatedIds(Object.assign({ type: 'names' }, names), emileDB);
            const dataTypeId = addEnergyDataType({
                serviceCategoryId: relatedIds.serviceCategoryId,
                unitId: relatedIds.unitId,
                readingTypeId: relatedIds.readingTypeId,
                commodityId: relatedIds.commodityId,
                accumulationBehaviourId: relatedIds.accumulationBehaviourId
            }, sessionUser, emileDB);
            energyDataType = getEnergyDataType(dataTypeId, emileDB);
        }
        catch {
            return undefined;
        }
        finally {
            emileDB.close();
        }
    }
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return energyDataType;
}
