import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getUser(userName) {
    const emileDB = sqlite(databasePath, {
        readonly: true
    });
    const user = emileDB
        .prepare(`select userName, canLogin, canUpdate, isAdmin
        from Users
        where recordDelete_timeMillis is null
        and userName = ?`)
        .get(userName);
    emileDB.close();
    return user;
}
