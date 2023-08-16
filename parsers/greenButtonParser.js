import fs from 'node:fs/promises';
import path from 'node:path';
import * as greenButtonParser from '@cityssm/green-button-parser';
import { addAsset } from '../database/addAsset.js';
import { addAssetAlias } from '../database/addAssetAlias.js';
import { addEnergyData } from '../database/addEnergyData.js';
import { getAssetByAssetAlias } from '../database/getAsset.js';
import { getAssetAliasTypeByAliasTypeKey } from '../database/getAssetAliasType.js';
import { getEnergyDataTypeByGreenButtonIds } from '../database/getEnergyDataType.js';
import { updateEnergyDataFileAsProcessed } from '../database/updateEnergyDataFile.js';
import { getAssetCategories } from '../helpers/functions.cache.js';
import { BaseParser } from './baseParser.js';
export class GreenButtonParser extends BaseParser {
    static fileExtensions = ['xml'];
    static aliasTypeKey = 'GreenButtonParser.IntervalBlock.link';
    static assetAliasType = getAssetAliasTypeByAliasTypeKey(this.aliasTypeKey);
    static parserUser = {
        userName: 'system.greenButtonParser',
        canLogin: true,
        canUpdate: true,
        isAdmin: false
    };
    async parseFile() {
        try {
            const atomXml = (await fs.readFile(path.join(this.energyDataFile.systemFolderPath, this.energyDataFile.systemFileName)));
            const greenButtonJson = await greenButtonParser.atomToGreenButtonJson(atomXml);
            const intervalBlockEntries = greenButtonParser.helpers.getEntriesByContentType(greenButtonJson, 'IntervalBlock');
            if (intervalBlockEntries.length === 0) {
                throw new Error('File contains no IntervalBlock entries.');
            }
            for (const intervalBlockEntry of intervalBlockEntries) {
                const assetAlias = intervalBlockEntry.links.self;
                if (assetAlias === undefined) {
                    throw new Error('No asset alias available on IntervalBlock entry.');
                }
                let assetId = this.energyDataFile.assetId;
                if ((assetId ?? '') === '') {
                    console.log(`assetAlias: ${assetAlias}`);
                    const asset = getAssetByAssetAlias(assetAlias, GreenButtonParser.assetAliasType?.aliasTypeId);
                    if (asset === undefined) {
                        const assetCategory = getAssetCategories()[0];
                        if (assetCategory === undefined) {
                            throw new Error(`Cannot create asset ${assetAlias} with no asset categories available.`);
                        }
                        assetId = addAsset({
                            assetName: assetAlias,
                            categoryId: assetCategory.categoryId
                        }, GreenButtonParser.parserUser);
                        addAssetAlias({
                            assetId,
                            aliasTypeId: GreenButtonParser.assetAliasType?.aliasTypeId,
                            assetAlias
                        }, GreenButtonParser.parserUser);
                    }
                    else {
                        assetId = asset.assetId;
                    }
                }
                const meterReadingEntry = greenButtonParser.helpers.getMeterReadingEntryFromIntervalBlockEntry(greenButtonJson, intervalBlockEntry);
                if (meterReadingEntry === undefined) {
                    throw new Error('Unable to find related MeterReading entry.');
                }
                const readingType = greenButtonParser.helpers.getReadingTypeEntryFromMeterReadingEntry(greenButtonJson, meterReadingEntry);
                if (readingType === undefined) {
                    throw new Error('Unable to find related ReadingType entry.');
                }
                const usagePoint = greenButtonParser.helpers.getUsagePointEntryFromMeterReadingEntry(greenButtonJson, meterReadingEntry);
                if (usagePoint === undefined) {
                    throw new Error('Unable to find related UsagePoint entry.');
                }
                const energyDataType = getEnergyDataTypeByGreenButtonIds({
                    serviceCategoryId: usagePoint.content.UsagePoint.ServiceCategory?.kind.toString() ??
                        '',
                    unitId: readingType.content.ReadingType.uom?.toString() ?? '',
                    readingTypeId: readingType.content.ReadingType.kind?.toString(),
                    commodityId: readingType.content.ReadingType.commodity?.toString(),
                    accumulationBehaviourId: readingType.content.ReadingType.accumulationBehaviour?.toString()
                }, GreenButtonParser.parserUser, true);
                if (energyDataType === undefined) {
                    throw new Error('Unable to retrieve EnergyDataType.');
                }
                for (const intervalBlock of intervalBlockEntry.content.IntervalBlock) {
                    for (const intervalReading of intervalBlock.IntervalReading ?? []) {
                        if (intervalReading.timePeriod !== undefined &&
                            intervalReading.value !== undefined) {
                            addEnergyData({
                                assetId,
                                dataTypeId: energyDataType.dataTypeId,
                                fileId: this.energyDataFile.fileId,
                                timeSeconds: intervalReading.timePeriod?.start,
                                durationSeconds: intervalReading.timePeriod?.duration,
                                dataValue: intervalReading.value
                            }, GreenButtonParser.parserUser);
                        }
                    }
                }
            }
            updateEnergyDataFileAsProcessed(this.energyDataFile.fileId, GreenButtonParser.parserUser);
        }
        catch (error) {
            this.handleParseFileError(error);
            return false;
        }
        return true;
    }
}
