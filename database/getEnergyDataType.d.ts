import sqlite from 'better-sqlite3';
import type { EnergyDataType } from '../types/recordTypes.js';
export declare function getEnergyDataType(dataTypeId: number | string, connectedEmileDB?: sqlite.Database): EnergyDataType | undefined;
export declare function getEnergyDataTypeByGreenButtonIds(greenButtonIds: {
    serviceCategoryId: string;
    unitId: string;
    readingTypeId?: string;
    commodityId?: string;
    accumulationBehaviourId?: string;
}, sessionUser: EmileUser, createIfUnavailable?: boolean): EnergyDataType | undefined;
