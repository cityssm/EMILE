import type { EnergyDataFile } from '../types/recordTypes.js';
export declare function getPendingEnergyDataFiles(): EnergyDataFile[];
export declare function getFailedEnergyDataFiles(): EnergyDataFile[];
export declare function getProcessedEnergyDataFiles(searchString?: ''): EnergyDataFile[];
export declare function getEnergyDataFilesToProcess(): EnergyDataFile[];
