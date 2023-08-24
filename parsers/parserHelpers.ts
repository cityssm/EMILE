import { getExcelDateFromJs, getJsDateFromExcel } from 'excel-date-to-js'
import { getConfigProperty } from '../helpers/functions.config.js'

import {
  GreenButtonParser,
  type GreenButtonParserProperties
} from './greenButtonParser.js'
import { SheetParser, type SheetParserProperties } from './sheetParser.js'
import e from 'express'

/*
 * Parser Types
 */

export type ParserProperties =
  | GreenButtonParserProperties
  | SheetParserProperties

/*
 * File Extensions
 */

const _fileExtensions: string[] = []
_fileExtensions.push(
  ...SheetParser.fileExtensions,
  ...GreenButtonParser.fileExtensions
)

export const fileExtensions = new Set<string>(_fileExtensions)

export function getDefaultParserPropertiesByFileName(
  fileName: string
): ParserProperties | undefined {
  const fileExtension = fileName
    .toLowerCase()
    .slice(fileName.lastIndexOf('.') + 1)

  if (GreenButtonParser.fileExtensions.includes(fileExtension)) {
    return {
      parserClass: 'GreenButtonParser',
      parserConfig: ''
    } satisfies GreenButtonParserProperties
  }

  return undefined
}

const parserClasses: string[] = []
parserClasses.push(GreenButtonParser.name, SheetParser.name)

export function getParserClasses(): string[] {
  return parserClasses
}

const parserClassesAndConfigurations: string[] = []
parserClassesAndConfigurations.push(GreenButtonParser.name)

for (const [parserConfigName, parserConfig] of Object.entries(
  getConfigProperty('parserConfigs')
)) {
  parserClassesAndConfigurations.push(
    `${parserConfig.parserClass}::${parserConfigName}`
  )
}

export function getParserClassesAndConfigurations(): string[] {
  return parserClassesAndConfigurations
}

export function excelDateToDate(excelDate: number): Date {
  return getJsDateFromExcel(excelDate)
}
