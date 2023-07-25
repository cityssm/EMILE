export interface RecordUserNameDateTime {
    recordCreate_userName: string;
    recordCreate_dateTime: Date | string;
    recordUpdate_userName: string;
    recordUpdate_dateTime: Date | string;
    recordDelete_userName?: string;
    recordDelete_dateTime?: Date;
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
