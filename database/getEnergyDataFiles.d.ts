import type { EnergyDataFile } from '../types/recordTypes.js';
interface GetEnergyDataFilesFilters {
    isPending?: boolean;
    isProcessed?: boolean;
    isFailed?: boolean;
    searchString?: string;
    systemFolderPath?: string;
}
interface GetEnergyDataFilesOptions {
    limit: number | -1;
    includeSystemFileAndFolder: boolean;
    includeAssetDetails: boolean;
    includeDeletedRecords?: boolean;
}
export declare function getEnergyDataFiles(filters: GetEnergyDataFilesFilters, options: GetEnergyDataFilesOptions): EnergyDataFile[];
export declare function getPendingEnergyDataFiles(): EnergyDataFile[];
export declare function getFailedEnergyDataFiles(): EnergyDataFile[];
export declare function getProcessedEnergyDataFiles(searchString?: ''): EnergyDataFile[];
export declare function getEnergyDataFilesToProcess(): EnergyDataFile[];
export {};
