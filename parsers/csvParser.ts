import { BaseParser, type StringComparison } from './baseParser.js'

export interface CsvAliasProperties {
  aliasType: 'CSV'
  columnName: string
  comparison: StringComparison
}

export interface CsvParserProperties {
  parserClass: 'CsvParser'
}

export class CsvParser extends BaseParser {
  static fileExtensions = ['csv', 'txt']
}
