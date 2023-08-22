import type { DatabaseFile } from '../types/applicationTypes.js';
export declare const useTestDatabases: boolean;
export declare const databasePath_live = "data/emile.db";
export declare const databasePath_testing = "data/emile-testing.db";
export declare const databasePath: string;
export declare const backupFolder = "data/backups";
export declare function backupDatabase(): Promise<string | false>;
export declare function deleteDatabaseBackupFile(fileName: string): Promise<boolean>;
export declare function getBackedUpDatabaseFiles(): Promise<DatabaseFile[]>;
