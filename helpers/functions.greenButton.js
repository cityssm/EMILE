"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */
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
exports.recordGreenButtonData = exports.greenButtonAssetAliasType = void 0;
const green_button_parser_1 = require("@cityssm/green-button-parser");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const debug_1 = __importDefault(require("debug"));
const addAsset_js_1 = require("../database/addAsset.js");
const addAssetAlias_js_1 = require("../database/addAssetAlias.js");
const addEnergyData_js_1 = require("../database/addEnergyData.js");
const getAsset_js_1 = require("../database/getAsset.js");
const getAssetAliasType_js_1 = require("../database/getAssetAliasType.js");
const getEnergyData_js_1 = require("../database/getEnergyData.js");
const getEnergyDataType_js_1 = require("../database/getEnergyDataType.js");
const updateEnergyData_js_1 = require("../database/updateEnergyData.js");
const functions_database_js_1 = require("../helpers/functions.database.js");
const functions_cache_js_1 = require("./functions.cache.js");
const debug = (0, debug_1.default)('emile:functions.greenButton');
const greenButtonAliasTypeKey = 'GreenButtonParser.IntervalBlock.link';
exports.greenButtonAssetAliasType = (0, getAssetAliasType_js_1.getAssetAliasTypeByAliasTypeKey)(greenButtonAliasTypeKey);
const greenButtonUser = {
    userName: 'system.greenButton',
    canLogin: true,
    canUpdate: true,
    isAdmin: false
};
function getAssetIdFromIntervalBlock(intervalBlockEntry, connectedEmileDB) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let assetId;
        let assetAlias = (_a = intervalBlockEntry.links.self) !== null && _a !== void 0 ? _a : '';
        if (assetAlias === undefined) {
            throw new Error('No asset alias available on IntervalBlock entry.');
        }
        if (assetAlias.includes('/MeterReading/')) {
            assetAlias = assetAlias.slice(0, Math.max(0, assetAlias.indexOf('/MeterReading/')));
        }
        debug(`assetAlias: ${assetAlias}`);
        const asset = yield (0, getAsset_js_1.getAssetByAssetAlias)(assetAlias, exports.greenButtonAssetAliasType === null || exports.greenButtonAssetAliasType === void 0 ? void 0 : exports.greenButtonAssetAliasType.aliasTypeId, connectedEmileDB);
        // Create asset
        if (asset === undefined) {
            const assetCategory = (0, functions_cache_js_1.getAssetCategories)()[0];
            if (assetCategory === undefined) {
                throw new Error(`Cannot create asset ${assetAlias} with no asset categories available.`);
            }
            assetId = yield (0, addAsset_js_1.addAsset)({
                assetName: assetAlias,
                categoryId: assetCategory.categoryId
            }, greenButtonUser, connectedEmileDB);
            (0, addAssetAlias_js_1.addAssetAlias)({
                assetId,
                aliasTypeId: exports.greenButtonAssetAliasType === null || exports.greenButtonAssetAliasType === void 0 ? void 0 : exports.greenButtonAssetAliasType.aliasTypeId,
                assetAlias
            }, greenButtonUser, connectedEmileDB);
        }
        else {
            assetId = asset.assetId;
        }
        return assetId;
    });
}
function getEnergyDataTypeAndPowerOfTenMultiplier(greenButtonJson, intervalBlockEntry, connectedEmileDB) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        const meterReadingEntry = green_button_parser_1.helpers.getMeterReadingEntryFromIntervalBlockEntry(greenButtonJson, intervalBlockEntry);
        if (meterReadingEntry === undefined) {
            throw new Error('Unable to find related MeterReading entry.');
        }
        const readingType = green_button_parser_1.helpers.getReadingTypeEntryFromMeterReadingEntry(greenButtonJson, meterReadingEntry);
        if (readingType === undefined) {
            throw new Error('Unable to find related ReadingType entry.');
        }
        const usagePoint = green_button_parser_1.helpers.getUsagePointEntryFromMeterReadingEntry(greenButtonJson, meterReadingEntry);
        if (usagePoint === undefined) {
            throw new Error('Unable to find related UsagePoint entry.');
        }
        const powerOfTenMultiplier = (_a = readingType.content.ReadingType.powerOfTenMultiplier) !== null && _a !== void 0 ? _a : '0';
        return {
            energyDataType: yield (0, getEnergyDataType_js_1.getEnergyDataTypeByGreenButtonIds)({
                serviceCategoryId: (_c = (_b = usagePoint.content.UsagePoint.ServiceCategory) === null || _b === void 0 ? void 0 : _b.kind.toString()) !== null && _c !== void 0 ? _c : '',
                unitId: (_e = (_d = readingType.content.ReadingType.uom) === null || _d === void 0 ? void 0 : _d.toString()) !== null && _e !== void 0 ? _e : '',
                readingTypeId: (_f = readingType.content.ReadingType.kind) === null || _f === void 0 ? void 0 : _f.toString(),
                commodityId: (_g = readingType.content.ReadingType.commodity) === null || _g === void 0 ? void 0 : _g.toString(),
                accumulationBehaviourId: (_h = readingType.content.ReadingType.accumulationBehaviour) === null || _h === void 0 ? void 0 : _h.toString()
            }, greenButtonUser, true, connectedEmileDB),
            powerOfTenMultiplier: typeof powerOfTenMultiplier === 'string'
                ? Number.parseInt(powerOfTenMultiplier, 10)
                : powerOfTenMultiplier
        };
    });
}
function recordGreenButtonData(greenButtonJson, options) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        let recordCount = 0;
        const intervalBlockEntries = green_button_parser_1.helpers.getEntriesByContentType(greenButtonJson, 'IntervalBlock');
        if (intervalBlockEntries.length === 0) {
            throw new Error('File contains no IntervalBlock entries.');
        }
        let emileDB;
        try {
            emileDB = (0, better_sqlite3_1.default)(functions_database_js_1.databasePath);
            for (const intervalBlockEntry of intervalBlockEntries) {
                /*
                 * Ensure an assetId is available
                 */
                let assetId = options.assetId;
                if ((assetId !== null && assetId !== void 0 ? assetId : '') === '') {
                    assetId = yield getAssetIdFromIntervalBlock(intervalBlockEntry, emileDB);
                }
                /*
                 * Ensure a dataTypeId is available
                 */
                const energyDataTypeAndPower = yield getEnergyDataTypeAndPowerOfTenMultiplier(greenButtonJson, intervalBlockEntry, emileDB);
                if (energyDataTypeAndPower === undefined ||
                    energyDataTypeAndPower.energyDataType === undefined) {
                    throw new Error('Unable to retrieve EnergyDataType.');
                }
                /*
                 * Loop through IntervalReadings
                 */
                for (const intervalBlock of intervalBlockEntry.content.IntervalBlock) {
                    for (const intervalReading of (_a = intervalBlock.IntervalReading) !== null && _a !== void 0 ? _a : []) {
                        if (intervalReading.timePeriod !== undefined &&
                            intervalReading.value !== undefined) {
                            const currentDataPoint = yield (0, getEnergyData_js_1.getEnergyDataPoint)({
                                assetId: assetId,
                                dataTypeId: energyDataTypeAndPower.energyDataType
                                    .dataTypeId,
                                timeSeconds: intervalReading.timePeriod.start,
                                durationSeconds: intervalReading.timePeriod.duration
                            }, emileDB);
                            if (currentDataPoint === undefined) {
                                yield (0, addEnergyData_js_1.addEnergyData)({
                                    assetId,
                                    dataTypeId: energyDataTypeAndPower.energyDataType.dataTypeId,
                                    fileId: options.fileId,
                                    timeSeconds: (_b = intervalReading.timePeriod) === null || _b === void 0 ? void 0 : _b.start,
                                    durationSeconds: (_c = intervalReading.timePeriod) === null || _c === void 0 ? void 0 : _c.duration,
                                    dataValue: intervalReading.value,
                                    powerOfTenMultiplier: energyDataTypeAndPower.powerOfTenMultiplier
                                }, greenButtonUser, emileDB);
                                recordCount += 1;
                            }
                            else if (currentDataPoint.dataValue !== intervalReading.value ||
                                currentDataPoint.powerOfTenMultiplier !==
                                    energyDataTypeAndPower.powerOfTenMultiplier) {
                                (0, updateEnergyData_js_1.updateEnergyDataValue)({
                                    dataId: currentDataPoint.dataId,
                                    fileId: options.fileId,
                                    dataValue: intervalReading.value,
                                    powerOfTenMultiplier: energyDataTypeAndPower.powerOfTenMultiplier
                                }, greenButtonUser, emileDB);
                                recordCount += 1;
                            }
                        }
                    }
                }
            }
        }
        finally {
            if (emileDB !== undefined) {
                emileDB.close();
            }
        }
        return recordCount;
    });
}
exports.recordGreenButtonData = recordGreenButtonData;
