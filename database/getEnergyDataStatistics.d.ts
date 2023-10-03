export interface EnergyDataStatistics {
    assetIdCount: number;
    timeSecondsMin: number;
    endTimeSecondsMax: number;
}
export declare function getEnergyDataStatistics(): Promise<EnergyDataStatistics>;
