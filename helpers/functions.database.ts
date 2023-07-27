import Debug from 'debug'

import * as configFunctions from './functions.config.js'

const debug = Debug('emile:functions.database')

// Determine if test databases should be used

export const useTestDatabases =
  configFunctions.getConfigProperty('application.useTestDatabases') ||
  process.env.TEST_DATABASES === 'true'

if (useTestDatabases) {
  debug('Using "-testing" databases.')
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const databasePath_live = 'data/emile.db'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const databasePath_testing = 'data/emile-testing.db'

export const databasePath = useTestDatabases
  ? databasePath_testing
  : databasePath_live

export const backupFolder = 'data/backups'
