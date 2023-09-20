import fs from 'node:fs/promises'
import path from 'node:path'

import * as greenButtonParser from '@cityssm/green-button-parser'

import { updateEnergyDataFileAsProcessed } from '../database/updateEnergyDataFile.js'
import { recordGreenButtonData } from '../helpers/functions.greenButton.js'

import { BaseParser } from './baseParser.js'

export interface GreenButtonParserProperties {
  parserClass: 'GreenButtonParser'
  parserConfig: ''
}

export class GreenButtonParser extends BaseParser {
  static fileExtensions = ['xml']

  async parseFile(): Promise<boolean> {
    try {
      const atomXml = (await fs.readFile(
        path.join(
          this.energyDataFile.systemFolderPath,
          this.energyDataFile.systemFileName
        )
      )) as unknown as string

      const greenButtonJson = await greenButtonParser.atomToGreenButtonJson(
        atomXml
      )

      await recordGreenButtonData(greenButtonJson, {
        assetId: this.energyDataFile.assetId ?? undefined,
        fileId: this.energyDataFile.fileId
      })

      updateEnergyDataFileAsProcessed(
        this.energyDataFile.fileId,
        GreenButtonParser.parserUser
      )
    } catch (error) {
      this.handleParseFileError(error)
      return false
    }

    return true
  }
}
