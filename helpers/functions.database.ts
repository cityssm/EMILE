import Debug from 'debug'

import * as configFunctions from './functions.config.js'

const debug = Debug('general-licence-manager:databasePaths')

// Determine if test databases should be used

export const useTestDatabases =
  configFunctions.getConfigProperty('application.useTestDatabases') ||
  process.env.TEST_DATABASES === 'true'

if (useTestDatabases) {
  debug('Using "-testing" databases.')
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const emileDB_live = 'data/emile.db'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const emileDB_testing = 'data/emile-testing.db'

export const emileDB = useTestDatabases ? emileDB_testing : emileDB_live

export const backupFolder = 'data/backups'
