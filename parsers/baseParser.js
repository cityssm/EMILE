import { deleteEnergyDataByFileId } from '../database/deleteEnergyData.js';
import { updateEnergyDataFileAsFailed } from '../database/updateEnergyDataFile.js';
export class BaseParser {
    static parserUser = {
        userName: 'system.baseParser',
        canLogin: true,
        canUpdate: true,
        isAdmin: false
    };
    energyDataFile;
    constructor(energyDataFile) {
        if (this.constructor === BaseParser) {
            throw new Error('BaseParser cannot be instantiated.');
        }
        this.energyDataFile = energyDataFile;
    }
    async parseFile() {
        throw new Error('parseFile() must be implemented');
    }
    handleParseFileError(error) {
        deleteEnergyDataByFileId(this.energyDataFile.fileId, BaseParser.parserUser);
        updateEnergyDataFileAsFailed({
            fileId: this.energyDataFile.fileId,
            processedMessage: error.name,
            processedTimeMillis: Date.now()
        }, BaseParser.parserUser);
    }
}
