import sqlite from 'better-sqlite3';
import type { AssetCategory } from '../types/recordTypes.js';
export declare function addAssetCategory(category: AssetCategory, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): number;
