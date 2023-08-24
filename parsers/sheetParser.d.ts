import { BaseParser } from './baseParser.js';
export interface SheetParserProperties {
    parserClass: 'SheetParser';
    parserConfig: '';
}
export declare class SheetParser extends BaseParser {
    static fileExtensions: string[];
    static parserUser: EmileUser;
    parseFile(): Promise<boolean>;
}
