import fs from 'node:fs/promises'
import path from 'node:path'

import { atomToGreenButtonJson } from '@cityssm/green-button-parser'
import type sqlite from 'better-sqlite3'

import { updateEnergyDataFileAsProcessed } from '../database/updateEnergyDataFile.js'
import { recordGreenButtonData } from '../helpers/functions.greenButton.js'

import { BaseParser } from './baseParser.js'

export interface GreenButtonParserProperties {
  parserClass: 'GreenButtonParser'
  parserConfig: ''
}

export class GreenButtonParser extends BaseParser {
  static fileExtensions = ['xml']

  async parseFile(emileDB: sqlite.Database): Promise<boolean> {
    try {
      const atomXml = (await fs.readFile(
        path.join(
          this.energyDataFile.systemFolderPath,
          this.energyDataFile.systemFileName
        )
      )) as unknown as string

      const greenButtonJson = await atomToGreenButtonJson(atomXml)

      await recordGreenButtonData(greenButtonJson, {
        assetId: this.energyDataFile.assetId ?? undefined,
        fileId: this.energyDataFile.fileId
      }, emileDB)

      await updateEnergyDataFileAsProcessed(
        this.energyDataFile.fileId,
        GreenButtonParser.parserUser,
        emileDB
      )
    } catch (error) {
      await this.handleParseFileError(error, emileDB)
      return false
    }

    return true
  }
}
