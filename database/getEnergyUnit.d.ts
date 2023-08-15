import sqlite from 'better-sqlite3';
import type { EnergyUnit } from '../types/recordTypes.js';
export declare function getEnergyUnitByGreenButtonId(unitGreenButtonId: string, connectedEmileDB?: sqlite.Database): EnergyUnit | undefined;
