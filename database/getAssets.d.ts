import type sqlite from 'better-sqlite3';
import type { Asset } from '../types/recordTypes.js';
interface GetAssetsFilters {
    groupId?: number | string;
}
interface GetAssetsOptions {
    includeEnergyDataStats?: boolean;
}
export declare function getAssets(filters: GetAssetsFilters, options?: GetAssetsOptions, connectedEmileDB?: sqlite.Database): Promise<Asset[]>;
export {};
