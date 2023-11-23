import fs from 'node:fs/promises';
import path from 'node:path';
import { atomToGreenButtonJson } from '@cityssm/green-button-parser';
import { updateEnergyDataFileAsProcessed } from '../database/updateEnergyDataFile.js';
import { recordGreenButtonData } from '../helpers/functions.greenButton.js';
import { BaseParser } from './baseParser.js';
export class GreenButtonParser extends BaseParser {
    static fileExtensions = ['xml'];
    async parseFile(emileDB) {
        try {
            const atomXml = (await fs.readFile(path.join(this.energyDataFile.systemFolderPath, this.energyDataFile.systemFileName)));
            const greenButtonJson = await atomToGreenButtonJson(atomXml);
            await recordGreenButtonData(greenButtonJson, {
                assetId: this.energyDataFile.assetId ?? undefined,
                fileId: this.energyDataFile.fileId
            }, emileDB);
            await updateEnergyDataFileAsProcessed(this.energyDataFile.fileId, GreenButtonParser.parserUser, emileDB);
        }
        catch (error) {
            await this.handleParseFileError(error, emileDB);
            return false;
        }
        return true;
    }
}
