import type { ADWebAuthConfig } from '@cityssm/ad-web-auth-connector/types.js';
export interface Config {
    application: {
        applicationName?: string;
        backgroundURL?: string;
        bigLogoURL?: string;
        smallLogoURL?: string;
        httpPort?: number;
        userDomain?: string;
        maximumProcesses?: number;
        useTestDatabases?: boolean;
    };
    session: {
        cookieName?: string;
        secret?: string;
        maxAgeMillis?: number;
        doKeepAlive?: boolean;
    };
    reverseProxy: {
        disableCompression?: boolean;
        disableEtag?: boolean;
        urlPrefix?: '' | `/${string}`;
    };
    activeDirectory?: ConfigActiveDirectory;
    adWebAuthConfig?: ADWebAuthConfig;
    parserConfigs?: Record<string, ConfigParserConfiguration>;
    tempUsers?: ConfigTemporaryUserCredentials[];
    settings?: {
        reportKeyAccessDays?: number;
    };
}
export interface ConfigActiveDirectory {
    url: string;
    baseDN: string;
    username: string;
    password: string;
}
export interface ConfigTemporaryUserCredentials {
    user: ConfigTemporaryUser;
    password: string;
}
export interface ConfigTemporaryUser extends EmileUser {
    userName: `~~${string}`;
}
export interface ConfigParserConfiguration {
    parserClass: 'SheetParser';
    configName: string;
    aliasTypeKey?: string;
    columns: {
        assetAlias?: ConfigParserDataField<string>;
        dataType: {
            serviceCategory: ConfigParserDataField<string>;
            unit: ConfigParserDataField<string>;
            readingType?: ConfigParserDataField<string>;
            commodity?: ConfigParserDataField<string>;
            accumulationBehaviour?: ConfigParserDataField<string>;
        };
        timeSeconds: ConfigParserDataField<number>;
        durationSeconds: ConfigParserDataField<number>;
        dataValue: ConfigParserDataField<number>;
        powerOfTenMultiplier?: ConfigParserDataField<number>;
    };
}
export type ConfigParserDataField<T> = ConfigParserDataFieldValue<T> | ConfigParserDataFieldObjectKey | ConfigParserDataFieldFunction<T>;
export interface ConfigParserDataFieldValue<T> {
    dataType: 'value';
    dataValue: T;
}
export interface ConfigParserDataFieldObjectKey {
    dataType: 'objectKey';
    dataObjectKey: string;
}
export interface ConfigParserDataFieldFunction<T> {
    dataType: 'function';
    dataFunction: (dataObject: unknown) => T;
}
