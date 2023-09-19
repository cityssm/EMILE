interface EnergyDataStatistics {
    dataIdCount: number;
    assetIdDistinctCount: number;
    fileIdDistinctCount: number;
    timeSecondsMin: number;
    endTimeSecondsMax: number;
}
export declare function getEnergyDataStatistics(): Promise<EnergyDataStatistics>;
export {};
