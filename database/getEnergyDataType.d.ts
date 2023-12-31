import type sqlite from 'better-sqlite3';
import type { EnergyDataType } from '../types/recordTypes.js';
export declare function getEnergyDataType(dataTypeId: number | string, connectedEmileDB?: sqlite.Database): Promise<EnergyDataType | undefined>;
interface EnergyDataTypeGreenButtonIds {
    serviceCategoryId: string;
    unitId: string;
    readingTypeId?: string;
    commodityId?: string;
    accumulationBehaviourId?: string;
}
interface EnergyDataTypeNames {
    serviceCategory: string;
    unit: string;
    readingType: string | '';
    commodity: string | '';
    accumulationBehaviour: string | '';
}
export declare function getEnergyDataTypeByGreenButtonIds(greenButtonIds: EnergyDataTypeGreenButtonIds, sessionUser: EmileUser, createIfUnavailable: boolean, connectedEmileDB?: sqlite.Database): Promise<EnergyDataType | undefined>;
export declare function getEnergyDataTypeByNames(names: EnergyDataTypeNames, sessionUser: EmileUser, createIfUnavailable: boolean, connectedEmileDB?: sqlite.Database): Promise<EnergyDataType | undefined>;
export {};
