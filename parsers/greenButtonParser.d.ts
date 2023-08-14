import * as greenButtonParser from '@cityssm/green-button-parser';
import { BaseParser, type StringComparison } from './baseParser.js';
export interface GreenButtonAliasProperties {
    aliasType: 'GreenButton';
    contentType: greenButtonParser.types.GreenButtonContentType;
    entryKey: 'id' | 'title' | 'link';
    comparison: StringComparison;
}
export interface GreenButtonParserProperties {
    parserClass: 'GreenButtonParser';
}
export declare class GreenButtonParser extends BaseParser {
    static fileExtensions: string[];
    static parserUser: EmileUser;
    parseFile(): Promise<boolean>;
}
