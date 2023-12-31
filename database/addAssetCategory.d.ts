import type sqlite from 'better-sqlite3';
import type { AssetCategory } from '../types/recordTypes.js';
export declare function addAssetCategory(category: Partial<AssetCategory>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<number>;
