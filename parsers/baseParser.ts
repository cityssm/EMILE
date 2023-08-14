import { deleteEnergyDataByFileId } from '../database/deleteEnergyData.js'
import { updateEnergyDataFileAsFailed } from '../database/updateEnergyDataFile.js'
import type { EnergyDataFile } from '../types/recordTypes.js'

export type StringComparison = 'startsWith' | 'includes' | 'equals' | 'endsWith'

export class BaseParser {
  static parserUser: EmileUser = {
    userName: 'system.baseParser',
    canLogin: true,
    canUpdate: true,
    isAdmin: false
  }

  energyDataFile: EnergyDataFile

  constructor(energyDataFile: EnergyDataFile) {
    if (this.constructor === BaseParser) {
      throw new Error('BaseParser cannot be instantiated.')
    }

    this.energyDataFile = energyDataFile
  }

  async parseFile(): Promise<boolean> {
    throw new Error('parseFile() must be implemented')
  }

  handleParseFileError(error: Error): void {
    deleteEnergyDataByFileId(
      this.energyDataFile.fileId as number,
      BaseParser.parserUser
    )

    updateEnergyDataFileAsFailed(
      {
        fileId: this.energyDataFile.fileId as number,
        processedMessage: error.name,
        processedTimeMillis: Date.now()
      },
      BaseParser.parserUser
    )
  }
}
