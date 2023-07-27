import sqlite from 'better-sqlite3';
import type { AssetAlias } from '../types/recordTypes.js';
interface GetAssetAliasesFilters {
    assetId?: string | number;
}
export declare function getAssetAliases(filters: GetAssetAliasesFilters, connectedEmileDB?: sqlite.Database): AssetAlias[];
export {};
