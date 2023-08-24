import { getJsDateFromExcel } from 'excel-date-to-js';
import { getConfigProperty } from '../helpers/functions.config.js';
import { GreenButtonParser } from './greenButtonParser.js';
import { SheetParser } from './sheetParser.js';
const _fileExtensions = [];
_fileExtensions.push(...SheetParser.fileExtensions, ...GreenButtonParser.fileExtensions);
export const fileExtensions = new Set(_fileExtensions);
export function getDefaultParserPropertiesByFileName(fileName) {
    const fileExtension = fileName
        .toLowerCase()
        .slice(fileName.lastIndexOf('.') + 1);
    if (GreenButtonParser.fileExtensions.includes(fileExtension)) {
        return {
            parserClass: 'GreenButtonParser',
            parserConfig: ''
        };
    }
    return undefined;
}
const parserClasses = [];
parserClasses.push(GreenButtonParser.name, SheetParser.name);
export function getParserClasses() {
    return parserClasses;
}
const parserClassesAndConfigurations = [];
parserClassesAndConfigurations.push(GreenButtonParser.name);
for (const [parserConfigName, parserConfig] of Object.entries(getConfigProperty('parserConfigs'))) {
    parserClassesAndConfigurations.push(`${parserConfig.parserClass}::${parserConfigName}`);
}
export function getParserClassesAndConfigurations() {
    return parserClassesAndConfigurations;
}
export function excelDateToDate(excelDate) {
    return getJsDateFromExcel(excelDate);
}
