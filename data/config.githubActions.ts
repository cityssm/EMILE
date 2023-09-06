import { enbridgeUsageHistory } from '../parsers/sheetParserConfigs.js'

import baseConfig from './config.base.js'

export const config = Object.assign({}, baseConfig)

config.application.useTestDatabases = true

config.tempUsers = [
  {
    user: {
      userName: '~~testReadOnlyUser',
      canLogin: true,
      canUpdate: false,
      isAdmin: false
    },
    password: 'p@ssw0rd'
  },
  {
    user: {
      userName: '~~testUpdateUser',
      canLogin: true,
      canUpdate: true,
      isAdmin: false
    },
    password: 'p@ssw0rd'
  },
  {
    user: {
      userName: '~~testAdmin',
      canLogin: true,
      canUpdate: true,
      isAdmin: true
    },
    password: 'p@ssw0rd'
  }
]

config.parserConfigs = config.parserConfigs ?? {}

config.parserConfigs.enbridgeUsageHistory = enbridgeUsageHistory

export default config
