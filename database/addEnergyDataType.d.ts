import type sqlite from 'better-sqlite3';
import type { EnergyDataType } from '../types/recordTypes.js';
export declare function addEnergyDataType(energyDataType: Partial<EnergyDataType>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<number>;
