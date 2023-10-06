import type sqlite from 'better-sqlite3';
import type { EnergyData } from '../types/recordTypes.js';
export declare function addEnergyData(data: Partial<EnergyData>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<number | undefined>;
