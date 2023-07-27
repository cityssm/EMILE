import type { CacheTableName } from '../types/applicationTypes.js';
import type { AssetCategory } from '../types/recordTypes.js';
export declare function getAssetCategories(): AssetCategory[];
export declare function clearCacheByTableName(tableName: CacheTableName, relayMessage?: boolean): void;
