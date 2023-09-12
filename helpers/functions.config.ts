// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import './polyfills.js'

// eslint-disable-next-line n/no-missing-import
import type { ADWebAuthConfig } from '@cityssm/ad-web-auth-connector/types.js'

import { config } from '../data/config.js'
import type {
  ConfigActiveDirectory,
  ConfigGreenButtonSubscription,
  ConfigParserConfiguration,
  ConfigTemporaryUserCredentials
} from '../types/configTypes.js'

/*
 * SET UP FALLBACK VALUES
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
const property_session_maxAgeMillis = 'session.maxAgeMillis'

const configFallbackValues = new Map<string, unknown>()

configFallbackValues.set('application.applicationName', 'EMILE')
configFallbackValues.set('application.backgroundURL', '/images/background.jpg')
configFallbackValues.set('application.bigLogoURL', '/images/logo.svg')
configFallbackValues.set('application.smallLogoURL', '/images/logo-small.svg')
configFallbackValues.set('application.httpPort', 7000)
configFallbackValues.set('application.maximumProcesses', 4)
configFallbackValues.set('application.useTestDatabases', false)

configFallbackValues.set('tempUsers', [])

configFallbackValues.set('reverseProxy.disableCompression', false)
configFallbackValues.set('reverseProxy.disableEtag', false)
configFallbackValues.set('reverseProxy.urlPrefix', '')

configFallbackValues.set('session.cookieName', 'emile-user-sid')
configFallbackValues.set('session.secret', 'cityssm/emile')
configFallbackValues.set(property_session_maxAgeMillis, 60 * 60 * 1000)
configFallbackValues.set('session.doKeepAlive', false)

configFallbackValues.set('parserConfigs', {})

configFallbackValues.set('settings.reportKeyAccessDays', 5)

configFallbackValues.set('subscriptions.greenButton', {})

/*
 * Set up function overloads
 */

export function getConfigProperty(
  propertyName:
    | 'application.applicationName'
    | 'application.backgroundURL'
    | 'application.bigLogoURL'
    | 'application.smallLogoURL'
    | 'application.userDomain'
    | 'reverseProxy.urlPrefix'
    | 'session.cookieName'
    | 'session.secret'
): string

export function getConfigProperty(
  propertyName:
    | 'application.httpPort'
    | 'application.maximumProcesses'
    | typeof property_session_maxAgeMillis
    | 'settings.reportKeyAccessDays'
): number

export function getConfigProperty(
  propertyName:
    | 'application.useTestDatabases'
    | 'reverseProxy.disableCompression'
    | 'reverseProxy.disableEtag'
    | 'session.doKeepAlive'
): boolean

export function getConfigProperty(
  propertyName: 'tempUsers'
): ConfigTemporaryUserCredentials[]

export function getConfigProperty(
  propertyName: 'activeDirectory'
): ConfigActiveDirectory | undefined

export function getConfigProperty(
  propertyName: 'adWebAuthConfig'
): ADWebAuthConfig | undefined

export function getConfigProperty(
  propertyName: 'parserConfigs'
): Record<string, ConfigParserConfiguration>

export function getConfigProperty(
  propertyName: 'subscriptions.greenButton'
): Record<string, ConfigGreenButtonSubscription>

export function getConfigProperty(propertyName: string): unknown {
  const propertyNameSplit = propertyName.split('.')

  let currentObject = config

  for (const propertyNamePiece of propertyNameSplit) {
    if (Object.hasOwn(currentObject, propertyNamePiece)) {
      currentObject = currentObject[propertyNamePiece]
      continue
    }

    return configFallbackValues.get(propertyName)
  }

  return currentObject
}

export const keepAliveMillis = getConfigProperty('session.doKeepAlive')
  ? Math.max(
      getConfigProperty(property_session_maxAgeMillis) / 2,
      getConfigProperty(property_session_maxAgeMillis) - 10 * 60 * 1000
    )
  : 0

export default {
  getConfigProperty,
  keepAliveMillis
}
