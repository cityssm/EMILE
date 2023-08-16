import { type CsvParserProperties } from './csvParser.js';
import { type GreenButtonParserProperties } from './greenButtonParser.js';
export type ParserProperties = GreenButtonParserProperties | CsvParserProperties;
export declare const fileExtensions: Set<string>;
export declare function getDefaultParserPropertiesByFileName(fileName: string): ParserProperties | undefined;
export declare function getParserClasses(): string[];
