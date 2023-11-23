import type sqlite from 'better-sqlite3';
import type { EnergyDataFile } from '../types/recordTypes.js';
export type StringComparison = 'startsWith' | 'includes' | 'equals' | 'endsWith';
export declare class BaseParser {
    static parserUser: EmileUser;
    energyDataFile: EnergyDataFile;
    constructor(energyDataFile: EnergyDataFile);
    parseFile(connectedEmileDB: sqlite.Database): Promise<boolean>;
    handleParseFileError(error: Error, connectedEmileDB?: sqlite.Database): Promise<void>;
}
