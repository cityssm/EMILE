import type sqlite from 'better-sqlite3';
import { BaseParser } from './baseParser.js';
export interface SheetParserProperties {
    parserClass: 'SheetParser';
    parserConfig: '';
}
export declare class SheetParser extends BaseParser {
    static fileExtensions: string[];
    static parserUser: EmileUser;
    parseFile(emileDB: sqlite.Database): Promise<boolean>;
}
