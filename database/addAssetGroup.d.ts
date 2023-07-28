import sqlite from 'better-sqlite3';
import type { AssetGroup } from '../types/recordTypes.js';
export declare function addAssetGroup(group: AssetGroup, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): number;
