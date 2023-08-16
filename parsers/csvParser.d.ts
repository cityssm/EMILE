import { BaseParser } from './baseParser.js';
export interface CsvParserProperties {
    parserClass: 'CsvParser';
}
export declare class CsvParser extends BaseParser {
    static fileExtensions: string[];
}
