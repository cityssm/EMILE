import type sqlite from 'better-sqlite3';
import type { EnergyUnit } from '../types/recordTypes.js';
export declare function getEnergyUnit(filterField: 'unitId' | 'unit' | 'greenButtonId', filterValue: string, connectedEmileDB?: sqlite.Database): Promise<EnergyUnit | undefined>;
