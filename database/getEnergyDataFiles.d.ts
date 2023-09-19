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
export declare function getEnergyDataFiles(filters: GetEnergyDataFilesFilters, options: GetEnergyDataFilesOptions): Promise<EnergyDataFile[]>;
export declare function getPendingEnergyDataFiles(): Promise<EnergyDataFile[]>;
export declare function getFailedEnergyDataFiles(): Promise<EnergyDataFile[]>;
export declare function getProcessedEnergyDataFiles(searchString?: ''): Promise<EnergyDataFile[]>;
export declare function getEnergyDataFilesToProcess(): Promise<EnergyDataFile[]>;
export {};
