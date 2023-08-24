import { BaseParser } from './baseParser.js';
export interface GreenButtonParserProperties {
    parserClass: 'GreenButtonParser';
    parserConfig: '';
}
export declare class GreenButtonParser extends BaseParser {
    static fileExtensions: string[];
    static aliasTypeKey: string;
    static assetAliasType: import("../types/recordTypes.js").AssetAliasType | undefined;
    static parserUser: EmileUser;
    parseFile(): Promise<boolean>;
}
