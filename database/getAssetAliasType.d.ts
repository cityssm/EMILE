import type sqlite from 'better-sqlite3';
import type { AssetAliasType } from '../types/recordTypes.js';
export declare function getAssetAliasTypeByAliasTypeKey(aliasTypeKey: string, connectedEmileDB?: sqlite.Database): Promise<AssetAliasType | undefined>;
