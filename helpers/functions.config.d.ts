import './polyfills.js';
import type { ADWebAuthConfig } from '@cityssm/ad-web-auth-connector/types.js';
import type { ConfigActiveDirectory, ConfigTemporaryUserCredentials } from '../types/configTypes.js';
export declare function getConfigProperty(propertyName: 'application.applicationName' | 'application.backgroundURL' | 'application.bigLogoURL' | 'application.smallLogoURL' | 'application.userDomain' | 'reverseProxy.urlPrefix' | 'session.cookieName' | 'session.secret'): string;
export declare function getConfigProperty(propertyName: 'application.httpPort' | 'application.maximumProcesses' | 'session.maxAgeMillis'): number;
export declare function getConfigProperty(propertyName: 'application.useTestDatabases' | 'reverseProxy.disableCompression' | 'reverseProxy.disableEtag' | 'session.doKeepAlive'): boolean;
export declare function getConfigProperty(propertyName: 'tempUsers'): ConfigTemporaryUserCredentials[];
export declare function getConfigProperty(propertyName: 'activeDirectory'): ConfigActiveDirectory | undefined;
export declare function getConfigProperty(propertyName: 'adWebAuthConfig'): ADWebAuthConfig | undefined;
export declare const keepAliveMillis: number;
declare const _default: {
    getConfigProperty: typeof getConfigProperty;
    keepAliveMillis: number;
};
export default _default;
