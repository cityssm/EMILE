import 'core-js/es/object/index.js';
import cluster from 'node:cluster';
import Debug from 'debug';
const debug = Debug('monty:polyfills');
if (!Object.hasOwn(cluster, 'setupPrimary') &&
    Object.hasOwn(cluster, 'setupMaster')) {
    debug('Applying cluster.setupPrimary() polyfill');
    cluster.setupPrimary = cluster.setupMaster;
}
