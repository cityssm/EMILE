import sqlite from 'better-sqlite3';
import type { Asset } from '../types/recordTypes.js';
export declare function addAsset(asset: Partial<Asset>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): number;
