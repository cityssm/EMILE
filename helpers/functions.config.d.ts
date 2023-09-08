import './polyfills.js';
import type { ADWebAuthConfig } from '@cityssm/ad-web-auth-connector/types.js';
import type { ConfigActiveDirectory, ConfigParserConfiguration, ConfigTemporaryUserCredentials } from '../types/configTypes.js';
declare const property_session_maxAgeMillis = "session.maxAgeMillis";
export declare function getConfigProperty(propertyName: 'application.applicationName' | 'application.backgroundURL' | 'application.bigLogoURL' | 'application.smallLogoURL' | 'application.userDomain' | 'reverseProxy.urlPrefix' | 'session.cookieName' | 'session.secret'): string;
export declare function getConfigProperty(propertyName: 'application.httpPort' | 'application.maximumProcesses' | typeof property_session_maxAgeMillis | 'settings.reportKeyAccessDays'): number;
export declare function getConfigProperty(propertyName: 'application.useTestDatabases' | 'reverseProxy.disableCompression' | 'reverseProxy.disableEtag' | 'session.doKeepAlive'): boolean;
export declare function getConfigProperty(propertyName: 'tempUsers'): ConfigTemporaryUserCredentials[];
export declare function getConfigProperty(propertyName: 'activeDirectory'): ConfigActiveDirectory | undefined;
export declare function getConfigProperty(propertyName: 'adWebAuthConfig'): ADWebAuthConfig | undefined;
export declare function getConfigProperty(propertyName: 'parserConfigs'): Record<string, ConfigParserConfiguration>;
export declare const keepAliveMillis: number;
declare const _default: {
    getConfigProperty: typeof getConfigProperty;
    keepAliveMillis: number;
};
export default _default;
