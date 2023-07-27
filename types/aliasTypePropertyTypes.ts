// eslint-disable-next-line n/no-missing-import
import type { GreenButtonContentType } from '@cityssm/green-button-parser/types/contentTypes.js'

export type AliasProperties = GreenButtonAliasProperties | CsvAliasProperties

export type StringComparison = 'startsWith' | 'includes' | 'equals' | 'endsWith'

export interface GreenButtonAliasProperties {
  propertyType: 'GreenButton'
  contentType: GreenButtonContentType
  entryKey: 'id' | 'title' | 'link'
  comparison: StringComparison
}

export interface CsvAliasProperties {
  propertyType: 'CSV'
  columnName: string
  comparison: StringComparison
}
