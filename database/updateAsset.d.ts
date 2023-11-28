import type sqlite from 'better-sqlite3';
import type { Asset } from '../types/recordTypes.js';
export declare function updateAsset(asset: Asset, sessionUser: EmileUser): Promise<boolean>;
export declare function updateAssetTimeSeconds(assetId: number | string, connectedEmileDB?: sqlite.Database): Promise<boolean>;
export declare function updateAllAssetTimeSeconds(): Promise<void>;
