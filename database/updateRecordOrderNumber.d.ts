import type sqlite from 'better-sqlite3';
type RecordTable = 'AssetCategories';
export declare function updateRecordOrderNumber(recordTable: RecordTable, recordId: number | string, orderNumber: number | string, connectedEmileDB: sqlite.Database): boolean;
export {};
