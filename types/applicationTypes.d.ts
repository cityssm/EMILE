type MessageTypes = 'clearCache' | 'runFileProcessor';
export interface WorkerMessage {
    messageType: MessageTypes;
    timeMillis: number;
    pid: number;
}
export type CacheTableName = 'AssetCategories' | 'AssetAliasTypes';
export interface ClearCacheWorkerMessage extends WorkerMessage {
    messageType: 'clearCache';
    tableName: CacheTableName;
}
export interface RunFileProcessorWorkerMessage extends WorkerMessage {
    messageType: 'runFileProcessor';
}
export {};
