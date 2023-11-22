import type sqlite from 'better-sqlite3';
export declare const energyDataTablePrefix = "EnergyData_AssetId_";
interface TableNames {
    raw: string;
    daily: string;
    monthly: string;
}
export declare function getEnergyDataTableNames(assetId: number | string): TableNames;
export declare function refreshAggregatedEnergyDataTables(assetId: number | string, emileDB: sqlite.Database): void;
export declare function reloadEnergyDataTableNames(connectedEmileDB?: sqlite.Database): Promise<Set<string>>;
export declare function refreshEnergyDataTableViews(emileDB: sqlite.Database): Promise<void>;
export declare function ensureEnergyDataTablesExists(assetId: number | string, connectedEmileDB?: sqlite.Database): Promise<{
    raw: string;
    daily: string;
    monthly: string;
}>;
export {};
