import sqlite from 'better-sqlite3';
import type { EnergyServiceCategory } from '../types/recordTypes.js';
export declare function getEnergyServiceCategoryByGreenButtonId(serviceCategoryGreenButtonId: string, connectedEmileDB?: sqlite.Database): EnergyServiceCategory | undefined;
export declare function getEnergyServiceCategoryByName(serviceCategoryName: string, connectedEmileDB?: sqlite.Database): EnergyServiceCategory | undefined;
