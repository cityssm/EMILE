import fs from 'node:fs/promises';
import path from 'node:path';
import * as greenButtonParser from '@cityssm/green-button-parser';
import { BaseParser } from './baseParser.js';
export class GreenButtonParser extends BaseParser {
    static fileExtensions = ['xml'];
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
            if ((this.energyDataFile.assetId ?? '') === '') {
            }
        }
        catch (error) {
            this.handleParseFileError(error);
            return false;
        }
    }
}
