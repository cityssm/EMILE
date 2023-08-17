import cluster from 'node:cluster';
import Debug from 'debug';
import { getAssetAliasTypes as getAssetAliasTypesFromDatabase } from '../database/getAssetAliasTypes.js';
import { getAssetCategories as getAssetCategoriesFromDatabase } from '../database/getAssetCategories.js';
const debug = Debug(`emile:functions.cache:${process.pid}`);
let assetCategories = [];
export function getAssetCategories() {
    if (assetCategories.length === 0) {
        debug('Cache miss: AssetCategories');
        assetCategories = getAssetCategoriesFromDatabase();
    }
    return assetCategories;
}
let assetAliasTypes = [];
export function getAssetAliasTypes() {
    if (assetAliasTypes.length === 0) {
        debug('Cache miss: AssetAliasTypes');
        assetAliasTypes = getAssetAliasTypesFromDatabase();
    }
    return assetAliasTypes;
}
export function clearCacheByTableName(tableName, relayMessage = true) {
    switch (tableName) {
        case 'AssetAliasTypes': {
            assetAliasTypes = [];
            break;
        }
        case 'AssetCategories': {
            assetCategories = [];
            break;
        }
    }
    try {
        if (relayMessage && cluster.isWorker && process.send !== undefined) {
            const workerMessage = {
                messageType: 'clearCache',
                tableName,
                timeMillis: Date.now(),
                pid: process.pid
            };
            debug(`Sending clear cache from worker: ${tableName}`);
            process.send(workerMessage);
        }
    }
    catch {
        debug('Error sending clear cache message.');
    }
}
process.on('message', (message) => {
    if (message.messageType === 'clearCache' && message.pid !== process.pid) {
        debug(`Clearing cache: ${message.tableName}`);
        clearCacheByTableName(message.tableName, false);
    }
});
