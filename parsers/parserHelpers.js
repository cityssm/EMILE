import { CsvParser } from './csvParser.js';
import { GreenButtonParser } from './greenButtonParser.js';
const _fileExtensions = [];
_fileExtensions.push(...CsvParser.fileExtensions, ...GreenButtonParser.fileExtensions);
export const fileExtensions = new Set(_fileExtensions);
export function getDefaultParserPropertiesByFileName(fileName) {
    const fileExtension = fileName
        .toLowerCase()
        .slice(fileName.lastIndexOf('.') + 1);
    if (GreenButtonParser.fileExtensions.includes(fileExtension)) {
        return {
            parserClass: 'GreenButtonParser'
        };
    }
    else if (CsvParser.fileExtensions.includes(fileExtension)) {
        return {
            parserClass: 'CsvParser'
        };
    }
    return undefined;
}
