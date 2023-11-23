import type sqlite from 'better-sqlite3';
export declare function deleteAssetAliases(filterField: 'aliasId' | 'assetId', filterValue: number | string, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<boolean>;
