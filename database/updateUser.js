import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
function updateUserPermission(userName, permission, permissionValue, sessionUser) {
    const emileDB = sqlite(databasePath);
    const result = emileDB
        .prepare(`update Users
        set ${permission} = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and userName = ?`)
        .run(permissionValue, sessionUser.userName, Date.now(), userName);
    emileDB.close();
    return result.changes > 0;
}
export function updateUserCanLogin(userName, canLogin, sessionUser) {
    return updateUserPermission(userName, 'canLogin', canLogin, sessionUser);
}
export function updateUserCanUpdate(userName, canUpdate, sessionUser) {
    return updateUserPermission(userName, 'canUpdate', canUpdate, sessionUser);
}
export function updateUserIsAdmin(userName, isAdmin, sessionUser) {
    return updateUserPermission(userName, 'isAdmin', isAdmin, sessionUser);
}
