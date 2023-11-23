import type sqlite from 'better-sqlite3';
import type { AssetAliasType } from '../types/recordTypes.js';
export declare function addAssetAliasType(aliasType: Partial<AssetAliasType>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<number>;
