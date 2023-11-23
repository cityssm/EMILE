import type sqlite from 'better-sqlite3';
import type { Asset } from '../types/recordTypes.js';
export declare function getAsset(assetId: string | number, connectedEmileDB?: sqlite.Database): Promise<Asset | undefined>;
export declare function getAssetByAssetAlias(assetAlias: string, aliasTypeId?: number | string, connectedEmileDB?: sqlite.Database): Promise<Asset | undefined>;
