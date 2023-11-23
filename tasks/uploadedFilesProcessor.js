import fs from 'node:fs/promises';
import path from 'node:path';
import chokidar from 'chokidar';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';
import { addEnergyDataFile } from '../database/addEnergyDataFile.js';
import { importedFolderRoot, uploadsFolder } from '../helpers/functions.files.js';
import { fileExtensions as allowedFileExtensions, getDefaultParserPropertiesByFileName } from '../parsers/parserHelpers.js';
const debug = Debug('emile:tasks:uploadedFilesProcessor');
process.title = 'EMILE - uploadedFilesProcessor';
const processorUser = {
    userName: 'system.uploadProcessor',
    canLogin: false,
    canUpdate: true,
    isAdmin: true
};
const timestampPrependedRegex = /^\[\d+\].+/;
let terminateTask = false;
let isProcessing = false;
let processAgainOnComplete = false;
async function processUploadedFiles() {
    if (isProcessing) {
        debug('Already running');
        processAgainOnComplete = true;
        return;
    }
    isProcessing = true;
    processAgainOnComplete = false;
    const fileNames = await fs.readdir(uploadsFolder);
    const rightNow = new Date();
    const systemFolderPath = path.join(importedFolderRoot, `${rightNow.getFullYear().toString()}-${(rightNow.getMonth() + 1).toString()}`);
    try {
        await fs.mkdir(systemFolderPath);
    }
    catch {
    }
    for (const fileName of fileNames) {
        if (terminateTask) {
            break;
        }
        const fileNameLowerCase = fileName.toLowerCase();
        if (fileNameLowerCase === 'readme.md') {
            continue;
        }
        const fileExtension = fileNameLowerCase.slice(fileNameLowerCase.lastIndexOf('.') + 1);
        let extensionAllowed = false;
        for (const allowedFileExtension of allowedFileExtensions) {
            if (allowedFileExtension === fileExtension) {
                extensionAllowed = true;
                break;
            }
        }
        let originalFileName = fileName;
        if (timestampPrependedRegex.test(originalFileName)) {
            originalFileName = originalFileName.slice(Math.max(0, originalFileName.indexOf(']') + 1));
        }
        const systemFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;
        await fs.copyFile(path.join(uploadsFolder, fileName), path.join(systemFolderPath, systemFileName));
        const parserProperties = getDefaultParserPropertiesByFileName(originalFileName);
        await addEnergyDataFile({
            originalFileName,
            systemFileName,
            systemFolderPath,
            parserProperties,
            isPending: extensionAllowed,
            isFailed: !extensionAllowed,
            processedTimeMillis: extensionAllowed ? undefined : Date.now(),
            processedMessage: extensionAllowed
                ? ''
                : `File extension not allowed: ${fileExtension}`
        }, processorUser);
        await fs.unlink(path.join(uploadsFolder, fileName));
    }
    isProcessing = false;
    if (processAgainOnComplete) {
        processAgainOnComplete = false;
        await processUploadedFiles();
    }
}
await processUploadedFiles().catch((error) => {
    debug('Error running task.');
    debug(error);
});
const intervalID = setIntervalAsync(processUploadedFiles, 6 * 3600 * 1000);
chokidar.watch(uploadsFolder).on('add', processUploadedFiles);
exitHook(() => {
    terminateTask = true;
    try {
        void clearIntervalAsync(intervalID);
    }
    catch {
        debug('Error exiting task.');
    }
});
