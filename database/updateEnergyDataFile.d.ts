interface FailedEnergyDataFile {
    fileId: number;
    processedMessage: string;
    processedTimeMillis: number;
}
export declare function updateEnergyDataFileAsFailed(energyDataFile: FailedEnergyDataFile, sessionUser: EmileUser): boolean;
interface PendingEnergyDataFile {
    fileId: number | string;
    assetId: number | string;
    parserClass: string;
}
export declare function updatePendingEnergyDataFile(energyDataFile: PendingEnergyDataFile, sessionUser: EmileUser): boolean;
export declare function updateEnergyDataFileAsReadyToProcess(fileId: string | number, sessionUser: EmileUser): boolean;
export {};
