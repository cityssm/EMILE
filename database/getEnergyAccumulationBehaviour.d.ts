import type sqlite from 'better-sqlite3';
import type { EnergyAccumulationBehaviour } from '../types/recordTypes.js';
export declare function getEnergyAccumulationBehaviour(filterField: 'accumulationBehaviourId' | 'accumulationBehaviour' | 'greenButtonId', filterValue: string, connectedEmileDB?: sqlite.Database): Promise<EnergyAccumulationBehaviour | undefined>;
