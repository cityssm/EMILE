export class BaseParser {
    #energyDataFile;
    constructor(energyDataFile) {
        if (this.constructor === BaseParser) {
            throw new Error('BaseParser cannot be instantiated.');
        }
        this.#energyDataFile = energyDataFile;
    }
}
