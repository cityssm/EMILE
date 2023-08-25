import sqlite from 'better-sqlite3';
import type { AssetCategory } from '../types/recordTypes.js';
export declare function getAssetCategories(connectedEmileDB?: sqlite.Database): AssetCategory[];
