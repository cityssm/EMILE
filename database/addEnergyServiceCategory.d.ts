import sqlite from 'better-sqlite3';
import type { EnergyServiceCategory } from '../types/recordTypes.js';
export declare function addEnergyServiceCategory(serviceCategory: EnergyServiceCategory, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): number;
