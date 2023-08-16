import {
  CsvParser,
  type CsvParserProperties
} from './csvParser.js'
import {
  GreenButtonParser,
  type GreenButtonParserProperties
} from './greenButtonParser.js'

/*
 * Parser Types
 */

export type ParserProperties = GreenButtonParserProperties | CsvParserProperties

/*
 * File Extensions
 */

const _fileExtensions: string[] = []
_fileExtensions.push(
  ...CsvParser.fileExtensions,
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
      parserClass: 'GreenButtonParser'
    } satisfies GreenButtonParserProperties
  } else if (CsvParser.fileExtensions.includes(fileExtension)) {
    return {
      parserClass: 'CsvParser'
    } satisfies CsvParserProperties
  }

  return undefined
}

const parserClasses: string[] = []
parserClasses.push(GreenButtonParser.name, CsvParser.name)

export function getParserClasses(): string[] {
  return parserClasses
}
