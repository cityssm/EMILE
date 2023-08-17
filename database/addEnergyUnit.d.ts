import sqlite from 'better-sqlite3';
import type { EnergyUnit } from '../types/recordTypes.js';
export declare function addEnergyUnit(unit: Partial<EnergyUnit>, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): number;
