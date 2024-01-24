import { ssmPuc, enbridgeUsageHistory } from '../parsers/sheetParserConfigs.js'

import baseConfig from './config.base.js'

export const config = Object.assign({}, baseConfig)

config.parserConfigs = config.parserConfigs ?? {}

config.parserConfigs.ssmPuc = ssmPuc
config.parserConfigs.enbridgeUsageHistory = enbridgeUsageHistory

config.settings = config.settings ?? {}
config.settings.greenButton = {
  usageProperty: 'currentBillingPeriodOverAllConsumption'
}

config.subscriptions = config.subscriptions ?? {}
config.subscriptions.greenButton = config.subscriptions.greenButton ?? {}

export default config
