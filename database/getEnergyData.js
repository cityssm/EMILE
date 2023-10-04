"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-nested-ternary */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnergyDataFullyJoined = exports.getEnergyDataPoint = exports.getEnergyData = void 0;
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */
const lookups_js_1 = require("@cityssm/green-button-parser/lookups.js");
const utils_datetime_1 = require("@cityssm/utils-datetime");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const functions_database_js_1 = require("../helpers/functions.database.js");
const manageEnergyDataTables_js_1 = require("./manageEnergyDataTables.js");
// eslint-disable-next-line @typescript-eslint/naming-convention
function userFunction_getPowerOfTenMultiplierName(powerOfTenMultiplier) {
    var _a;
    if (powerOfTenMultiplier === 0) {
        return '';
    }
    return ((_a = lookups_js_1.powerOfTenMultipliers[powerOfTenMultiplier]) !== null && _a !== void 0 ? _a : powerOfTenMultiplier.toString());
}
function buildWhereClause(filters) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    let sqlWhereClause = '';
    const sqlParameters = [];
    if (((_a = filters.assetId) !== null && _a !== void 0 ? _a : '') !== '') {
        sqlWhereClause += ' and d.assetId = ?';
        sqlParameters.push(filters.assetId);
    }
    if (((_b = filters.categoryId) !== null && _b !== void 0 ? _b : '') !== '') {
        sqlWhereClause += ' and a.categoryId = ?';
        sqlParameters.push(filters.categoryId);
    }
    if (((_c = filters.groupId) !== null && _c !== void 0 ? _c : '') !== '') {
        sqlWhereClause +=
            ' and d.assetId in (select assetId from AssetGroupMembers where recordDelete_timeMillis is null and groupId = ?)';
        sqlParameters.push(filters.groupId);
    }
    if (((_d = filters.dataTypeId) !== null && _d !== void 0 ? _d : '') !== '') {
        sqlWhereClause += ' and d.dataTypeId = ?';
        sqlParameters.push(filters.dataTypeId);
    }
    if (((_e = filters.fileId) !== null && _e !== void 0 ? _e : '') !== '') {
        sqlWhereClause += ' and d.fileId = ?';
        sqlParameters.push(filters.fileId);
    }
    if (((_f = filters.startDateString) !== null && _f !== void 0 ? _f : '') !== '') {
        sqlWhereClause += ' and d.timeSeconds >= ?';
        sqlParameters.push((0, utils_datetime_1.dateStringToDate)((_g = filters.startDateString) !== null && _g !== void 0 ? _g : '').getTime() / 1000);
    }
    if (((_h = filters.timeSecondsMin) !== null && _h !== void 0 ? _h : '') !== '') {
        sqlWhereClause += ' and d.timeSeconds >= ?';
        sqlParameters.push(filters.timeSecondsMin);
    }
    if (((_j = filters.endDateString) !== null && _j !== void 0 ? _j : '') !== '') {
        sqlWhereClause += ' and d.timeSeconds <= ?';
        const endDate = (0, utils_datetime_1.dateStringToDate)((_k = filters.endDateString) !== null && _k !== void 0 ? _k : '');
        endDate.setDate(endDate.getDate() + 1);
        sqlParameters.push(endDate.getTime() / 1000);
    }
    if (((_l = filters.timeSecondsMax) !== null && _l !== void 0 ? _l : '') !== '') {
        sqlWhereClause += ' and d.timeSeconds <= ?';
        sqlParameters.push(filters.timeSecondsMax);
    }
    return {
        sqlWhereClause,
        sqlParameters
    };
}
function getEnergyData(filters, options) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const doGroupByDate = !((_a = options === null || options === void 0 ? void 0 : options.formatForExport) !== null && _a !== void 0 ? _a : false) &&
            filters.startDateString !== filters.endDateString;
        const columnNames = ((_b = options === null || options === void 0 ? void 0 : options.formatForExport) !== null && _b !== void 0 ? _b : false)
            ? `d.dataId,
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
            : doGroupByDate
                ? `min(d.dataId) as dataId,
        d.assetId, a.assetName,
        c.category, c.fontAwesomeIconClasses,
        d.dataTypeId,
        t.serviceCategoryId, ts.serviceCategory,
        t.unitId, tu.unit, tu.unitLong, tu.preferredPowerOfTenMultiplier,
        userFunction_getPowerOfTenMultiplierName(d.powerOfTenMultiplier) as powerOfTenMultiplierName,
        userFunction_getPowerOfTenMultiplierName(tu.preferredPowerOfTenMultiplier) as preferredPowerOfTenMultiplierName,
        t.readingTypeId, tr.readingType,
        t.commodityId, tc.commodity,
        t.accumulationBehaviourId, ta.accumulationBehaviour,
        min(d.fileId) as fileId,
        f.originalFileName,
        min(d.timeSeconds) as timeSeconds,
        max(d.endTimeSeconds) - min(d.timeSeconds) as durationSeconds,
        max(d.endTimeSeconds) as endTimeSeconds,
        sum(d.dataValue) as dataValue,
        d.powerOfTenMultiplier`
                : `d.dataId,
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
        d.dataValue, d.powerOfTenMultiplier`;
        const emileDB = yield (0, functions_database_js_1.getConnectionWhenAvailable)(true);
        const tableName = ((_c = filters.assetId) !== null && _c !== void 0 ? _c : '') === ''
            ? 'EnergyData'
            : yield (0, manageEnergyDataTables_js_1.ensureEnergyDataTableExists)(filters.assetId, emileDB);
        const { sqlParameters, sqlWhereClause } = buildWhereClause(filters);
        let sql = `select ${columnNames}
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
    left join EnergyDataFiles f
      on d.fileId = f.fileId
    where d.recordDelete_timeMillis is null
      and a.recordDelete_timeMillis is null
      ${sqlWhereClause}`;
        if (doGroupByDate) {
            sql +=
                " group by d.assetId, d.dataTypeId, substr(datetime(d.timeSeconds, 'unixepoch', 'localtime'), 1, 10), d.powerOfTenMultiplier";
        }
        const orderBy = ((_d = options === null || options === void 0 ? void 0 : options.formatForExport) !== null && _d !== void 0 ? _d : false)
            ? ''
            : ' order by assetId, dataTypeId, timeSeconds';
        emileDB.function('userFunction_getPowerOfTenMultiplierName', userFunction_getPowerOfTenMultiplierName);
        const tempTableName = (0, functions_database_js_1.getTempTableName)();
        emileDB
            .prepare(`create temp table ${tempTableName} as ${sql}`)
            .run(sqlParameters);
        const data = emileDB
            .prepare(`select * from ${tempTableName} ${orderBy}`)
            .all();
        emileDB.close();
        return data;
    });
}
exports.getEnergyData = getEnergyData;
function getEnergyDataPoint(filters, connectedEmileDB) {
    return __awaiter(this, void 0, void 0, function* () {
        const emileDB = connectedEmileDB === undefined
            ? (0, better_sqlite3_1.default)(functions_database_js_1.databasePath, {
                readonly: true
            })
            : connectedEmileDB;
        const tableName = yield (0, manageEnergyDataTables_js_1.ensureEnergyDataTableExists)(filters.assetId, emileDB);
        const dataPoint = emileDB
            .prepare(`select dataId, assetId, dataTypeId, fileId,
        timeSeconds, durationSeconds, dataValue, powerOfTenMultiplier
        from ${tableName}
        where recordDelete_timeMillis is null
        and dataTypeId = ?
        and timeSeconds = ?
        and durationSeconds = ?`)
            .get(filters.assetId, filters.dataTypeId, filters.timeSeconds, filters.durationSeconds);
        if (connectedEmileDB === undefined) {
            emileDB.close();
        }
        return dataPoint;
    });
}
exports.getEnergyDataPoint = getEnergyDataPoint;
function getEnergyDataFullyJoined() {
    return __awaiter(this, void 0, void 0, function* () {
        const emileDB = yield (0, functions_database_js_1.getConnectionWhenAvailable)();
        const tempTableName = (0, functions_database_js_1.getTempTableName)();
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
        and a.recordDelete_timeMillis is null`;
        emileDB.prepare(`create temp table ${tempTableName} as ${sql}`).run();
        return emileDB.prepare(`select * from ${tempTableName}`).raw().all();
    });
}
exports.getEnergyDataFullyJoined = getEnergyDataFullyJoined;
