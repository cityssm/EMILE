import type sqlite from 'better-sqlite3';
export declare function deleteAssetGroupMember(groupId: number | string, assetId: number | string, sessionUser: EmileUser): Promise<boolean>;
export declare function deleteAssetGroupMembersByAssetId(assetId: number | string, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<boolean>;
export declare function deleteAssetGroupMembersByGroupId(groupId: number | string, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<boolean>;
