type PermissionValue = 1 | 0 | boolean | '1' | '0';
export declare function updateUserCanLogin(userName: string, canLogin: PermissionValue, sessionUser: EmileUser): boolean;
export declare function updateUserCanUpdate(userName: string, canUpdate: PermissionValue, sessionUser: EmileUser): boolean;
export declare function updateUserIsAdmin(userName: string, isAdmin: PermissionValue, sessionUser: EmileUser): boolean;
export declare function updateUserReportKey(userName: string, sessionUser: EmileUser): string | false;
export {};
