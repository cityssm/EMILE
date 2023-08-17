import type { CacheTableName } from '../types/applicationTypes.js';
import type { AssetAliasType, AssetCategory } from '../types/recordTypes.js';
export declare function getAssetCategories(): AssetCategory[];
export declare function getAssetAliasTypes(): AssetAliasType[];
export declare function clearCacheByTableName(tableName: CacheTableName, relayMessage?: boolean): void;
