import Debug from 'debug';
import { getConfigProperty } from './functions.config.js';
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
