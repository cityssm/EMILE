import sqlite from 'better-sqlite3';
export declare function deleteAssetAlias(aliasId: number | string, sessionUser: EmileUser): boolean;
export declare function deleteAssetAliasesByAssetId(assetId: number | string, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): boolean;
