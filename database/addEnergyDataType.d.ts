import sqlite from 'better-sqlite3';
import type { EnergyDataType } from '../types/recordTypes.js';
export declare function addEnergyDataType(energyDataType: EnergyDataType, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): number;
