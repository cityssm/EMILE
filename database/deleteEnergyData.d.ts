import type sqlite from 'better-sqlite3';
export declare function deleteEnergyData(assetId: number | string, dataId: number | string, sessionUser: EmileUser): Promise<boolean>;
export declare function deleteEnergyDataByFileId(fileId: number | string, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<boolean>;
