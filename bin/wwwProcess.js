import http from 'node:http';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { app } from '../app.js';
import { getConfigProperty } from '../helpers/functions.config.js';
const debug = Debug(`emile:wwwProcess:${process.pid}`);
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    switch (error.code) {
        case 'EACCES': {
            debug('Requires elevated privileges');
            process.exit(1);
        }
        case 'EADDRINUSE': {
            debug('Port is already in use.');
            process.exit(1);
        }
        default: {
            throw error;
        }
    }
}
function onListening(server) {
    const addr = server.address();
    if (addr !== null) {
        const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port.toString()}`;
        debug(`HTTP Listening on ${bind}`);
    }
}
process.title = `${getConfigProperty('application.applicationName')} (Worker)`;
const httpPort = getConfigProperty('application.httpPort');
const httpServer = http.createServer(app);
httpServer.listen(httpPort);
httpServer.on('error', onError);
httpServer.on('listening', () => {
    onListening(httpServer);
});
exitHook(() => {
    debug('Closing HTTP');
    httpServer.close();
});
