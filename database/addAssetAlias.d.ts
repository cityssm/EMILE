import type sqlite from 'better-sqlite3';
import type { AssetAlias } from '../types/recordTypes.js';
export declare function addAssetAlias(assetAlias: Partial<AssetAlias>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<number>;
