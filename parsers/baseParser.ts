import type sqlite from 'better-sqlite3'

import { deleteEnergyDataByFileId } from '../database/deleteEnergyData.js'
import { updateEnergyDataFileAsFailed } from '../database/updateEnergyDataFile.js'
import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
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

  async parseFile(connectedEmileDB: sqlite.Database): Promise<boolean> {
    throw new Error('parseFile() must be implemented')
  }

  async handleParseFileError(
    error: Error,
    connectedEmileDB?: sqlite.Database
  ): Promise<void> {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

    await deleteEnergyDataByFileId(
      this.energyDataFile.fileId,
      BaseParser.parserUser,
      emileDB
    )

    await updateEnergyDataFileAsFailed(
      {
        fileId: this.energyDataFile.fileId,
        processedMessage: error.message,
        processedTimeMillis: Date.now()
      },
      BaseParser.parserUser,
      emileDB
    )

    if (connectedEmileDB === undefined) {
      emileDB.close()
    }
  }
}
