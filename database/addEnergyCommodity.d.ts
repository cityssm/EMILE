import type sqlite from 'better-sqlite3';
import type { EnergyCommodity } from '../types/recordTypes.js';
export declare function addEnergyCommodity(commodity: Partial<EnergyCommodity>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<number>;
