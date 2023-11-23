import path from 'node:path';
import Debug from 'debug';
import XLSX from 'xlsx';
import { addAsset } from '../database/addAsset.js';
import { addAssetAlias } from '../database/addAssetAlias.js';
import { addEnergyData } from '../database/addEnergyData.js';
import { getAssetByAssetAlias } from '../database/getAsset.js';
import { getAssetAliasTypeByAliasTypeKey } from '../database/getAssetAliasType.js';
import { getAssetCategories } from '../database/getAssetCategories.js';
import { getEnergyDataTypeByNames } from '../database/getEnergyDataType.js';
import { updateEnergyDataFileAsProcessed } from '../database/updateEnergyDataFile.js';
import { getConfigProperty } from '../helpers/functions.config.js';
import { BaseParser } from './baseParser.js';
const debug = Debug('emile:parsers:sheetParser');
function getDataFieldValue(row, dataField) {
    if (dataField !== undefined) {
        switch (dataField.dataType) {
            case 'value': {
                return dataField.dataValue;
            }
            case 'objectKey': {
                return row[dataField.dataObjectKey];
            }
            case 'function': {
                return dataField.dataFunction(row);
            }
            default: {
                const unknownDataType = dataField.dataType;
                debug(`Configuration error, unknown data type: ${unknownDataType}`);
            }
        }
    }
    return undefined;
}
export class SheetParser extends BaseParser {
    static fileExtensions = ['csv', 'xls', 'xlsx'];
    static parserUser = {
        userName: 'system.sheetParser',
        canLogin: true,
        canUpdate: true,
        isAdmin: false
    };
    async parseFile(emileDB) {
        const parserConfig = getConfigProperty('parserConfigs')?.[this.energyDataFile.parserProperties?.parserConfig ?? ''];
        if (parserConfig === undefined) {
            throw new Error(`Parser config unavailable: ${this.energyDataFile.parserProperties?.parserConfig ?? ''}`);
        }
        let aliasTypeId = -1;
        if (parserConfig.aliasTypeKey !== undefined) {
            const aliasType = await getAssetAliasTypeByAliasTypeKey(parserConfig.aliasTypeKey, emileDB);
            if (aliasType === undefined) {
                throw new Error(`aliasType unavailable for aliasTypeKey: ${parserConfig.aliasTypeKey}`);
            }
            aliasTypeId = aliasType.aliasTypeId;
        }
        try {
            const workbook = XLSX.readFile(path.join(this.energyDataFile.systemFolderPath, this.energyDataFile.systemFileName), {});
            if (workbook.SheetNames.length > 0) {
                debug(`Multiple sheets, importing the first one: ${workbook.SheetNames[0]}`);
            }
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet, {
                raw: true,
                rawNumbers: true
            });
            for (const row of rows) {
                let assetId = this.energyDataFile.assetId;
                if ((assetId ?? '') === '') {
                    const assetAlias = getDataFieldValue(row, parserConfig.columns.assetAlias);
                    if (assetAlias === undefined) {
                        throw new Error('No asset alias available.');
                    }
                    const asset = await getAssetByAssetAlias(assetAlias, aliasTypeId, emileDB);
                    if (asset === undefined) {
                        const assetCategory = getAssetCategories()[0];
                        if (assetCategory === undefined) {
                            throw new Error(`Cannot create asset ${assetAlias} with no asset categories available.`);
                        }
                        assetId = await addAsset({
                            assetName: assetAlias,
                            categoryId: assetCategory.categoryId
                        }, SheetParser.parserUser, emileDB);
                        await addAssetAlias({
                            assetId,
                            aliasTypeId,
                            assetAlias
                        }, SheetParser.parserUser, emileDB);
                    }
                    else {
                        assetId = asset.assetId;
                    }
                }
                const serviceCategoryName = (getDataFieldValue(row, parserConfig.columns.dataType.serviceCategory) ?? '');
                const unitName = (getDataFieldValue(row, parserConfig.columns.dataType.unit) ?? '');
                const readingTypeName = (getDataFieldValue(row, parserConfig.columns.dataType.readingType) ?? '');
                const commodityName = (getDataFieldValue(row, parserConfig.columns.dataType.commodity) ?? '');
                const accumulationBehaviourName = (getDataFieldValue(row, parserConfig.columns.dataType.accumulationBehaviour) ?? '');
                const energyDataType = await getEnergyDataTypeByNames({
                    serviceCategory: serviceCategoryName,
                    unit: unitName,
                    readingType: readingTypeName,
                    commodity: commodityName,
                    accumulationBehaviour: accumulationBehaviourName
                }, SheetParser.parserUser, true, emileDB);
                if (energyDataType === undefined) {
                    throw new Error('Unable to retrieve EnergyDataType.');
                }
                const timeSeconds = getDataFieldValue(row, parserConfig.columns.timeSeconds);
                const durationSeconds = getDataFieldValue(row, parserConfig.columns.durationSeconds);
                const dataValue = getDataFieldValue(row, parserConfig.columns.dataValue);
                const powerOfTenMultiplier = (getDataFieldValue(row, parserConfig.columns.powerOfTenMultiplier) ?? 0);
                if (dataValue === undefined ||
                    Number.isNaN(dataValue) ||
                    dataValue.toString() === '') {
                    debug(`Skipping data value for asset ${assetId ?? ''}: '${dataValue}'`);
                    continue;
                }
                await addEnergyData({
                    assetId,
                    dataTypeId: energyDataType.dataTypeId,
                    fileId: this.energyDataFile.fileId,
                    timeSeconds,
                    durationSeconds,
                    dataValue,
                    powerOfTenMultiplier
                }, SheetParser.parserUser, emileDB);
            }
            await updateEnergyDataFileAsProcessed(this.energyDataFile.fileId, SheetParser.parserUser, emileDB);
        }
        catch (error) {
            await this.handleParseFileError(error, emileDB);
            return false;
        }
        finally {
            if (emileDB !== undefined) {
                emileDB.close();
            }
        }
        return true;
    }
}
