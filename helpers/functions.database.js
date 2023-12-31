import fs from 'node:fs/promises';
import path from 'node:path';
import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { getConfigProperty } from './functions.config.js';
import { delay } from './functions.utilities.js';
const debug = Debug('emile:functions.database');
export const useTestDatabases = getConfigProperty('application.useTestDatabases') ||
    process.env.TEST_DATABASES === 'true';
if (useTestDatabases) {
    debug('Using "-testing" databases.');
}
export const databasePath_live = 'data/emile.db';
export const databasePath_testing = 'data/emile-testing.db';
export const databasePath = useTestDatabases
    ? databasePath_testing
    : databasePath_live;
export const backupFolder = 'data/backups';
export async function backupDatabase() {
    const databasePathSplit = databasePath.split(/[/\\]/);
    const backupFileName = `${Date.now().toString()}-${databasePathSplit.at(-1) ?? 'emile.db'}`;
    const backupDatabasePath = path.join(backupFolder, backupFileName);
    try {
        await fs.copyFile(databasePath, backupDatabasePath);
        return backupDatabasePath;
    }
    catch {
        return false;
    }
}
export async function deleteDatabaseBackupFile(fileName) {
    if (fileName.includes('/') ||
        fileName.includes('\\') ||
        fileName.includes('..')) {
        return false;
    }
    const backupFiles = await getBackedUpDatabaseFiles();
    const fileFound = backupFiles.some((possibleFile) => {
        return possibleFile.fileName === fileName;
    });
    if (fileFound) {
        await fs.unlink(path.join(backupFolder, fileName));
        return true;
    }
    return false;
}
export async function getBackedUpDatabaseFiles() {
    const databaseFiles = [];
    const fileNames = await fs.readdir(backupFolder);
    for (let index = fileNames.length - 1; index >= 0; index -= 1) {
        const fileName = fileNames[index];
        const fileStats = await fs.stat(path.join(backupFolder, fileName));
        if (fileStats.isFile() && fileName.endsWith('.db')) {
            databaseFiles.push({
                fileName,
                sizeInMegabytes: fileStats.size / (1024 * 1024),
                lastModifiedTime: fileStats.mtime.toString()
            });
        }
    }
    return databaseFiles;
}
export async function getConnectionWhenAvailable(readOnly = false) {
    try {
        return sqlite(databasePath, {
            readonly: readOnly
        });
    }
    catch {
        debug('Waiting 1s for database connection...');
        await delay(1000);
        return await getConnectionWhenAvailable(readOnly);
    }
}
export function getTempTableName() {
    return `tmp_${Date.now()}_${Math.round(Math.random() * 10000)}`;
}
export const queryMaxRetryCount = 20;
