// eslint-disable-next-line n/no-missing-import
import type { ADWebAuthConfig } from '@cityssm/ad-web-auth-connector/types.js'

export interface Config {
  application: {
    applicationName?: string
    backgroundURL?: string
    bigLogoURL?: string
    smallLogoURL?: string
    httpPort?: number
    userDomain?: string
    maximumProcesses?: number
    allowTesting?: boolean
  }
  session: {
    cookieName?: string
    secret?: string
    maxAgeMillis?: number
    doKeepAlive?: boolean
  }
  reverseProxy: {
    disableCompression?: boolean
    disableEtag?: boolean
    urlPrefix?: '' | `/${string}`
  }

  activeDirectory?: ConfigActiveDirectory
  adWebAuthConfig?: ADWebAuthConfig

  tempUsers?: ConfigTemporaryUserCredentials[]
}

export interface ConfigActiveDirectory {
  url: string
  baseDN: string
  username: string
  password: string
}

export interface ConfigTemporaryUserCredentials {
  user: ConfigTemporaryUser
  password: string
}

export interface ConfigTemporaryUser extends EmileUser {
  userName: `~~${string}`
}
