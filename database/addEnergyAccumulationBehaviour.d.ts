import sqlite from 'better-sqlite3';
import type { EnergyAccumulationBehaviour } from '../types/recordTypes.js';
export declare function addEnergyAccumulationBehaviour(accumulationBehaviour: Partial<EnergyAccumulationBehaviour>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): number;
