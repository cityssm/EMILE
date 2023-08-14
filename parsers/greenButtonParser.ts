import fs from 'node:fs/promises'
import path from 'node:path'

import * as greenButtonParser from '@cityssm/green-button-parser'

import { BaseParser, type StringComparison } from './baseParser.js'

export interface GreenButtonAliasProperties {
  aliasType: 'GreenButton'
  contentType: greenButtonParser.types.GreenButtonContentType
  entryKey: 'id' | 'title' | 'link'
  comparison: StringComparison
}

export interface GreenButtonParserProperties {
  parserClass: 'GreenButtonParser'
}

export class GreenButtonParser extends BaseParser {
  static fileExtensions = ['xml']

  static parserUser: EmileUser = {
    userName: 'system.greenButtonParser',
    canLogin: true,
    canUpdate: true,
    isAdmin: false
  }

  async parseFile(): Promise<boolean> {
    try {
      const atomXml = (await fs.readFile(
        path.join(
          this.energyDataFile.systemFolderPath,
          this.energyDataFile.systemFileName
        )
      )) as unknown as string

      const greenButtonJson = await greenButtonParser.atomToGreenButtonJson(atomXml)

      /*
       * Determine Asset
       */

      if ((this.energyDataFile.assetId ?? '') === '') {

        
      }

    } catch (error) {
      this.handleParseFileError(error)
      return false
    }
  }
}
