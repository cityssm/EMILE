import type sqlite from 'better-sqlite3';
import { BaseParser } from './baseParser.js';
export interface GreenButtonParserProperties {
    parserClass: 'GreenButtonParser';
    parserConfig: '';
}
export declare class GreenButtonParser extends BaseParser {
    static fileExtensions: string[];
    parseFile(emileDB: sqlite.Database): Promise<boolean>;
}
