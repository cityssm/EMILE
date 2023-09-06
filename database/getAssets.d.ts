import sqlite from 'better-sqlite3';
import type { Asset } from '../types/recordTypes.js';
interface GetAssetsFilters {
    groupId?: number | string;
}
export declare function getAssets(filters: GetAssetsFilters, connectedEmileDB?: sqlite.Database): Asset[];
export {};
