import { ssmPuc } from '../parsers/sheetParserConfigs.js';
import baseConfig from './config.base.js';
export const config = Object.assign({}, baseConfig);
config.parserConfigs = config.parserConfigs ?? {};
config.parserConfigs.ssmPuc = ssmPuc;
export default config;
