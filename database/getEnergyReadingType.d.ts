import type sqlite from 'better-sqlite3';
import type { EnergyReadingType } from '../types/recordTypes.js';
export declare function getEnergyReadingType(filterField: 'readingTypeId' | 'readingType' | 'greenButtonId', filterValue: string, connectedEmileDB?: sqlite.Database): Promise<EnergyReadingType | undefined>;
