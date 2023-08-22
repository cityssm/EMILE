import sqlite from 'better-sqlite3';
export declare function addUser(user: EmileUser, sessionUser: EmileUser, connectedEmileDB?: sqlite.Database): boolean;
