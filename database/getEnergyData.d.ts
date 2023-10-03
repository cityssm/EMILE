import sqlite from 'better-sqlite3';
import type { EnergyData } from '../types/recordTypes.js';
interface GetEnergyDataFilters {
    assetId?: number | string;
    categoryId?: number | string;
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
export declare function getEnergyData(filters: GetEnergyDataFilters, options?: GetEnergyDataOptions): Promise<EnergyData[]>;
export declare function getEnergyDataPoint(filters: {
    assetId: number;
    dataTypeId: number;
    timeSeconds: number;
    durationSeconds: number;
}, connectedEmileDB?: sqlite.Database): EnergyData | undefined;
export declare function getEnergyDataFullyJoined(): Promise<unknown[]>;
export {};
