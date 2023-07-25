import sqlite from 'better-sqlite3';
import type { EnergyReadingType } from '../types/recordTypes.js';
export declare function addEnergyReadingType(readingType: EnergyReadingType, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): number;
