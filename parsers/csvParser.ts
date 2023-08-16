import { BaseParser } from './baseParser.js'

export interface CsvParserProperties {
  parserClass: 'CsvParser'
}

export class CsvParser extends BaseParser {
  static fileExtensions = ['csv', 'txt']
}
