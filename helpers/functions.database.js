import Debug from 'debug';
import * as configFunctions from './functions.config.js';
const debug = Debug('general-licence-manager:databasePaths');
export const useTestDatabases = configFunctions.getConfigProperty('application.useTestDatabases') ||
    process.env.TEST_DATABASES === 'true';
if (useTestDatabases) {
    debug('Using "-testing" databases.');
}
export const emileDB_live = 'data/emile.db';
export const emileDB_testing = 'data/emile-testing.db';
export const emileDB = useTestDatabases ? emileDB_testing : emileDB_live;
export const backupFolder = 'data/backups';
