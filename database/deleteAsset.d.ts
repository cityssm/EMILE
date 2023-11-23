import type sqlite from 'better-sqlite3';
export declare function deleteAsset(assetId: number | string, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<boolean>;
