export interface WorkerMessage {
    messageType: string;
    timeMillis: number;
    pid: number;
}
export type CacheTableName = 'AbsenceTypes' | 'AfterHoursReasons' | 'CallOutResponseTypes' | 'EmployeeProperties';
export interface ClearCacheWorkerMessage extends WorkerMessage {
    messageType: 'clearCache';
    tableName: CacheTableName;
}
