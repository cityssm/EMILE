import sqlite from 'better-sqlite3';
import type { EnergyReadingType } from '../types/recordTypes.js';
export declare function getEnergyReadingTypeByGreenButtonId(readingTypeGreenButtonId: string, connectedEmileDB?: sqlite.Database): EnergyReadingType | undefined;
export declare function getEnergyReadingTypeByName(readingTypeName: string, connectedEmileDB?: sqlite.Database): EnergyReadingType | undefined;
