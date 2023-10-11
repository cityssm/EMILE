import type sqlite from 'better-sqlite3';
export declare const energyDataTablePrefix = "EnergyData_AssetId_";
export declare function reloadEnergyDataTableNames(connectedEmileDB?: sqlite.Database): Promise<Set<string>>;
export declare function refreshEnergyDataTableView(connectedEmileDB: sqlite.Database): Promise<void>;
export declare function ensureEnergyDataTableExists(assetId: number | string, connectedEmileDB?: sqlite.Database): Promise<string>;
