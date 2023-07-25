interface RecordUserNameDateTime {
    recordCreate_userName: string;
    recordCreate_dateTime: Date | string;
    recordUpdate_userName: string;
    recordUpdate_dateTime: Date | string;
    recordDelete_userName?: string;
    recordDelete_dateTime?: Date;
}
interface RecordGreenButton {
    greenButtonId: string;
}
export interface EnergyAccumulationBehaviour extends Partial<RecordUserNameDateTime>, Partial<RecordGreenButton> {
    accumulationBehaviourId?: number;
    accumulationBehaviour: string;
}
export interface EnergyServiceCategory extends Partial<RecordUserNameDateTime>, Partial<RecordGreenButton> {
    serviceCategoryId?: number;
    serviceCategory: string;
}
export interface EnergyUnit extends Partial<RecordUserNameDateTime>, Partial<RecordGreenButton> {
    unitId?: number;
    unit: string;
    unitLong?: string;
}
export interface EnergyReadingType extends Partial<RecordUserNameDateTime>, Partial<RecordGreenButton> {
    readingTypeId?: number;
    readingType: string;
}
export interface EnergyCommodity extends Partial<RecordUserNameDateTime>, Partial<RecordGreenButton> {
    commodityId?: number;
    commodity: string;
}
declare global {
    interface EmileUser extends Partial<RecordUserNameDateTime> {
        userName: string;
        canLogin: boolean;
        isAdmin: boolean;
    }
}
declare module 'express-session' {
    interface Session {
        user?: EmileUser;
    }
}
export {};
