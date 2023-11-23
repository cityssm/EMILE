import type sqlite from 'better-sqlite3';
import type { EnergyServiceCategory } from '../types/recordTypes.js';
export declare function addEnergyServiceCategory(serviceCategory: Partial<EnergyServiceCategory>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<number>;
