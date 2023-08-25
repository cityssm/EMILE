import sqlite from 'better-sqlite3';
import type { EnergyCommodity } from '../types/recordTypes.js';
export declare function getEnergyCommodityByGreenButtonId(commodityGreenButtonId: string, connectedEmileDB?: sqlite.Database): EnergyCommodity | undefined;
export declare function getEnergyCommodityByName(commodityName: string, connectedEmileDB?: sqlite.Database): EnergyCommodity | undefined;
