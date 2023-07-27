export interface WorkerMessage {
    messageType: string;
    timeMillis: number;
    pid: number;
}
export type CacheTableName = 'AssetCategories';
export interface ClearCacheWorkerMessage extends WorkerMessage {
    messageType: 'clearCache';
    tableName: CacheTableName;
}
