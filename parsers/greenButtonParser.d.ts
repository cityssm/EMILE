import { BaseParser } from './baseParser.js';
export interface GreenButtonParserProperties {
    parserClass: 'GreenButtonParser';
    parserConfig: '';
}
export declare class GreenButtonParser extends BaseParser {
    static fileExtensions: string[];
    parseFile(): Promise<boolean>;
}
