import type sqlite from 'better-sqlite3';
export declare const energyDataTablePrefix = "EnergyData_AssetId_";
type RawEnergyTableNameFormat = `${typeof energyDataTablePrefix}${number}`;
type DailyEnergyTableNameFormat = `${typeof energyDataTablePrefix}${number}_Daily`;
type MonthlyEnergyTableNameFormat = `${typeof energyDataTablePrefix}${number}_Monthly`;
type EnergyDataTableNameFormat = RawEnergyTableNameFormat | DailyEnergyTableNameFormat | MonthlyEnergyTableNameFormat;
interface TableNames {
    raw: RawEnergyTableNameFormat;
    daily: DailyEnergyTableNameFormat;
    monthly: MonthlyEnergyTableNameFormat;
}
export declare function getEnergyDataTableNames(assetId: number | string): TableNames;
export declare function refreshAggregatedEnergyDataTables(assetId: number | string, emileDB: sqlite.Database): void;
export declare function reloadEnergyDataTableNames(connectedEmileDB?: sqlite.Database): Promise<Set<EnergyDataTableNameFormat>>;
export declare function refreshEnergyDataTableViews(emileDB: sqlite.Database): Promise<void>;
export declare function ensureEnergyDataTablesExists(assetId: number | string, connectedEmileDB?: sqlite.Database): Promise<{
    raw: string;
    daily: string;
    monthly: string;
}>;
export {};
