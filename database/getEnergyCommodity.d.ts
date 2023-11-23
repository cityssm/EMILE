import type sqlite from 'better-sqlite3';
import type { EnergyCommodity } from '../types/recordTypes.js';
export declare function getEnergyCommodity(filterField: 'commodityId' | 'commodity' | 'greenButtonId', filterValue: string, connectedEmileDB?: sqlite.Database): Promise<EnergyCommodity | undefined>;
