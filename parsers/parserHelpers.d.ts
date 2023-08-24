import { type GreenButtonParserProperties } from './greenButtonParser.js';
import { type SheetParserProperties } from './sheetParser.js';
export type ParserProperties = GreenButtonParserProperties | SheetParserProperties;
export declare const fileExtensions: Set<string>;
export declare function getDefaultParserPropertiesByFileName(fileName: string): ParserProperties | undefined;
export declare function getParserClasses(): string[];
export declare function getParserClassesAndConfigurations(): string[];
export declare function excelDateToDate(excelDate: number): Date;
