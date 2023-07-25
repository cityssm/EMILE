import './polyfills.js';
import { config } from '../data/config.js';
const property_session_maxAgeMillis = 'session.maxAgeMillis';
const configFallbackValues = new Map();
configFallbackValues.set('application.applicationName', 'EMILE');
configFallbackValues.set('application.backgroundURL', '/images/background.jpg');
configFallbackValues.set('application.bigLogoURL', '/images/logo.svg');
configFallbackValues.set('application.smallLogoURL', '/images/logo-small.svg');
configFallbackValues.set('application.httpPort', 7000);
configFallbackValues.set('application.maximumProcesses', 4);
configFallbackValues.set('application.useTestDatabases', false);
configFallbackValues.set('tempUsers', []);
configFallbackValues.set('reverseProxy.disableCompression', false);
configFallbackValues.set('reverseProxy.disableEtag', false);
configFallbackValues.set('reverseProxy.urlPrefix', '');
configFallbackValues.set('session.cookieName', 'emile-user-sid');
configFallbackValues.set('session.secret', 'cityssm/emile');
configFallbackValues.set(property_session_maxAgeMillis, 60 * 60 * 1000);
configFallbackValues.set('session.doKeepAlive', false);
export function getConfigProperty(propertyName) {
    const propertyNameSplit = propertyName.split('.');
    let currentObject = config;
    for (const propertyNamePiece of propertyNameSplit) {
        if (Object.hasOwn(currentObject, propertyNamePiece)) {
            currentObject = currentObject[propertyNamePiece];
            continue;
        }
        return configFallbackValues.get(propertyName);
    }
    return currentObject;
}
export const keepAliveMillis = getConfigProperty('session.doKeepAlive')
    ? Math.max(getConfigProperty(property_session_maxAgeMillis) / 2, getConfigProperty(property_session_maxAgeMillis) - 10 * 60 * 1000)
    : 0;
export default {
    getConfigProperty,
    keepAliveMillis
};
