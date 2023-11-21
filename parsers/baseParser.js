import { deleteEnergyDataByFileId } from '../database/deleteEnergyData.js';
import { updateEnergyDataFileAsFailed } from '../database/updateEnergyDataFile.js';
import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
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
    async parseFile(connectedEmileDB) {
        throw new Error('parseFile() must be implemented');
    }
    async handleParseFileError(error, connectedEmileDB) {
        const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable());
        void deleteEnergyDataByFileId(this.energyDataFile.fileId, BaseParser.parserUser, emileDB);
        await updateEnergyDataFileAsFailed({
            fileId: this.energyDataFile.fileId,
            processedMessage: error.message,
            processedTimeMillis: Date.now()
        }, BaseParser.parserUser, emileDB);
        if (connectedEmileDB === undefined) {
            emileDB.close();
        }
    }
}
