import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getUsers() {
    const emileDB = sqlite(databasePath, {
        readonly: true
    });
    const users = emileDB
        .prepare(`select userName, canLogin, canUpdate, isAdmin
        from Users
        where recordDelete_timeMillis is null`)
        .all();
    emileDB.close();
    return users;
}
