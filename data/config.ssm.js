import { ssmPuc, enbridgeUsageHistory } from '../parsers/sheetParserConfigs.js';
import baseConfig from './config.base.js';
export const config = Object.assign({}, baseConfig);
config.parserConfigs = config.parserConfigs ?? {};
config.parserConfigs.ssmPuc = ssmPuc;
config.parserConfigs.enbridgeUsageHistory = enbridgeUsageHistory;
export default config;
