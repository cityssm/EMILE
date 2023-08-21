import type { EnergyData } from '../types/recordTypes.js';
interface GetEnergyDataFilters {
    assetId?: number | string;
    groupId?: number | string;
    dataTypeId?: number | string;
    fileId?: number | string;
    startDateString?: string;
    endDateString?: string;
    timeSecondsMin?: number | string;
    timeSecondsMax?: number | string;
}
interface GetEnergyDataOptions {
    formatForExport?: boolean;
}
export declare function getEnergyData(filters: GetEnergyDataFilters, options?: GetEnergyDataOptions): EnergyData[];
export {};
