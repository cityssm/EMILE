type PermissionValue = 1 | 0 | boolean | '1' | '0';
export declare function updateUserCanLogin(userName: string, canLogin: PermissionValue, sessionUser: EmileUser): Promise<boolean>;
export declare function updateUserCanUpdate(userName: string, canUpdate: PermissionValue, sessionUser: EmileUser): Promise<boolean>;
export declare function updateUserIsAdmin(userName: string, isAdmin: PermissionValue, sessionUser: EmileUser): Promise<boolean>;
export declare function updateUserReportKey(userName: string, sessionUser: EmileUser): Promise<string | false>;
export {};
