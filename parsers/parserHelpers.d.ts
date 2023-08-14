import { type CsvAliasProperties, type CsvParserProperties } from './csvParser.js';
import { type GreenButtonAliasProperties, type GreenButtonParserProperties } from './greenButtonParser.js';
export type AliasProperties = GreenButtonAliasProperties | CsvAliasProperties;
export type ParserProperties = GreenButtonParserProperties | CsvParserProperties;
export declare const fileExtensions: Set<string>;
export declare function getDefaultParserPropertiesByFileName(fileName: string): ParserProperties | undefined;
