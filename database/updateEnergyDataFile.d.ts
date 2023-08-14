interface PartialEnergyDataFile {
    fileId: number;
    processedMessage: string;
    processedTimeMillis: number;
}
export declare function updateEnergyDataFileAsFailed(energyDataFile: PartialEnergyDataFile, sessionUser: EmileUser): boolean;
export {};
