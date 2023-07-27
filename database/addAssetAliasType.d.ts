import sqlite from 'better-sqlite3';
import type { AssetAliasType } from '../types/recordTypes.js';
export declare function addAssetAliasType(aliasType: AssetAliasType, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): number;
