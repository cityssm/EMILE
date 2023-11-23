import sqlite from 'better-sqlite3';
export declare const recordColumns = " recordCreate_userName varchar(30) not null,\n    recordCreate_timeMillis integer not null,\n    recordUpdate_userName varchar(30) not null,\n    recordUpdate_timeMillis integer not null,\n    recordDelete_userName varchar(30),\n    recordDelete_timeMillis integer";
export declare function initializeDatabase(connectedEmileDB?: sqlite.Database): Promise<void>;
