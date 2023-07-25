import sqlite from 'better-sqlite3';
import type { EnergyCommodity } from '../types/recordTypes.js';
export declare function addEnergyCommodity(commodity: EnergyCommodity, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): number;
