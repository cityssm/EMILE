import sqlite from 'better-sqlite3';
export declare function updateEnergyDataValue(data: {
    dataId: number;
    assetId: number;
    fileId?: number;
    dataValue: number;
    powerOfTenMultiplier: number;
}, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): Promise<boolean>;
