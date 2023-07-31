import type { EnergyDataFile } from '../types/recordTypes.js'

export class BaseParser {
  #energyDataFile: EnergyDataFile

  constructor(energyDataFile: EnergyDataFile) {
    if (this.constructor === BaseParser) {
      throw new Error('BaseParser cannot be instantiated.')
    }

    this.#energyDataFile = energyDataFile
  }

  
}
