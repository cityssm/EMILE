import fs from 'node:fs/promises';
import path from 'node:path';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';
import { getEnergyDataFilesToProcess } from '../database/getEnergyDataFiles.js';
import { updateEnergyDataFileAsFailed } from '../database/updateEnergyDataFile.js';
import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { GreenButtonParser } from '../parsers/greenButtonParser.js';
import { getParserClasses } from '../parsers/parserHelpers.js';
import { SheetParser } from '../parsers/sheetParser.js';
const debug = Debug('emile:tasks:energyDataFilesProcessor');
process.title = 'EMILE - energyDataFilesProcessor';
const processorUser = {
    userName: 'system.fileProcessor',
    canLogin: false,
    canUpdate: true,
    isAdmin: true
};
let terminateTask = false;
let isRunning = false;
let runAgainOnComplete = false;
async function processFiles() {
    if (isRunning) {
        debug('Already running');
        runAgainOnComplete = true;
        return;
    }
    debug('Process started');
    isRunning = true;
    runAgainOnComplete = false;
    const emileDB = await getConnectionWhenAvailable();
    const dataFiles = await getEnergyDataFilesToProcess(emileDB);
    if (dataFiles.length > 0) {
        debug(`${dataFiles.length} files to process.`);
    }
    for (const dataFile of dataFiles) {
        if (terminateTask || runAgainOnComplete) {
            break;
        }
        debug(`Parsing ${dataFile.originalFileName} ...`);
        const filePath = path.join(dataFile.systemFolderPath, dataFile.systemFileName);
        try {
            await fs.access(filePath, fs.constants.R_OK);
        }
        catch (error) {
            debug(error);
            await updateEnergyDataFileAsFailed({
                fileId: dataFile.fileId,
                processedTimeMillis: Date.now(),
                processedMessage: 'File access error.'
            }, processorUser, emileDB);
            continue;
        }
        if (!getParserClasses().includes(dataFile.parserProperties?.parserClass ?? '')) {
            await updateEnergyDataFileAsFailed({
                fileId: dataFile.fileId,
                processedTimeMillis: Date.now(),
                processedMessage: `Selected parser not found: ${dataFile.parserProperties?.parserClass ?? ''}`
            }, processorUser, emileDB);
            continue;
        }
        let parser;
        switch (dataFile.parserProperties?.parserClass ?? '') {
            case 'GreenButtonParser': {
                parser = new GreenButtonParser(dataFile);
                break;
            }
            case 'SheetParser': {
                parser = new SheetParser(dataFile);
                break;
            }
            default: {
                await updateEnergyDataFileAsFailed({
                    fileId: dataFile.fileId,
                    processedTimeMillis: Date.now(),
                    processedMessage: `Selected parser not implemented: ${dataFile.parserProperties?.parserClass ?? ''}`
                }, processorUser, emileDB);
                continue;
            }
        }
        try {
            await parser.parseFile(emileDB);
        }
        catch {
            await updateEnergyDataFileAsFailed({
                fileId: dataFile.fileId,
                processedTimeMillis: Date.now(),
                processedMessage: `Error parsing file: ${dataFile.parserProperties?.parserClass ?? ''}`
            }, processorUser, emileDB);
        }
    }
    emileDB.close();
    isRunning = false;
    if (!terminateTask && runAgainOnComplete) {
        runAgainOnComplete = false;
        await processFiles();
    }
}
await processFiles().catch((error) => {
    debug('Error running task.');
    debug(error);
});
const intervalID = setIntervalAsync(processFiles, 3600 * 1000);
exitHook(() => {
    terminateTask = true;
    try {
        void clearIntervalAsync(intervalID);
    }
    catch {
        debug('Error exiting task.');
    }
});
process.on('message', (message) => {
    if (message.messageType === 'runFileProcessor') {
        debug('Running by request');
        void processFiles();
    }
});
