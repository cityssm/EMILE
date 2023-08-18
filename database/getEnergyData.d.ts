import type { EnergyData } from '../types/recordTypes.js';
interface GetEnergyDataFilters {
    assetId?: number | string;
    groupId?: number | string;
    fileId?: number | string;
    startDateString?: string;
    endDateString?: string;
}
export declare function getEnergyData(filters: GetEnergyDataFilters): EnergyData[];
export {};
