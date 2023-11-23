import type sqlite from 'better-sqlite3';
import type { EnergyReadingType } from '../types/recordTypes.js';
export declare function addEnergyReadingType(readingType: Partial<EnergyReadingType>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<number>;
