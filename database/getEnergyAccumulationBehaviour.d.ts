import sqlite from 'better-sqlite3';
import type { EnergyAccumulationBehaviour } from '../types/recordTypes.js';
export declare function getEnergyAccumulationBehaviourByGreenButtonId(accumulationBehaviourGreenButtonId: string, connectedEmileDB?: sqlite.Database): EnergyAccumulationBehaviour | undefined;
