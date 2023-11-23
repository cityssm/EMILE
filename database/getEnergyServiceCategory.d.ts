import type sqlite from 'better-sqlite3';
import type { EnergyServiceCategory } from '../types/recordTypes.js';
export declare function getEnergyServiceCategory(filterField: 'serviceCategoryId' | 'serviceCategory' | 'greenButtonId', filterValue: string, connectedEmileDB?: sqlite.Database): Promise<EnergyServiceCategory | undefined>;
