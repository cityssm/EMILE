import type { EnergyDataFile } from '../types/recordTypes.js';
export type StringComparison = 'startsWith' | 'includes' | 'equals' | 'endsWith';
export declare class BaseParser {
    static parserUser: EmileUser;
    energyDataFile: EnergyDataFile;
    constructor(energyDataFile: EnergyDataFile);
    parseFile(): Promise<boolean>;
    handleParseFileError(error: Error): void;
}
