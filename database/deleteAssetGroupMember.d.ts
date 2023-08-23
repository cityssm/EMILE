import sqlite from 'better-sqlite3';
export declare function deleteAssetGroupMember(groupId: number | string, assetId: number | string, sessionUser: EmileUser): boolean;
export declare function deleteAssetGroupMembersByAssetId(assetId: number | string, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): boolean;
export declare function deleteAssetGroupMembersByGroupId(groupId: number | string, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): boolean;
