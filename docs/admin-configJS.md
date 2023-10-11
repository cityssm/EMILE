[Home](https://cityssm.github.io/EMILE/)
•
[Help](https://cityssm.github.io/EMILE/docs/)

# config.js

The `data/config.js` file is used to customize the EMILE application.
On first install, the file does not exist. You can create one from scratch,
or get started by using the `data/config.base.js` file as a template.

```javascript
export const config = {}

// your configuration

export default config
```

## Application and Server Settings

### config.application = {}

| Property Name      | Type    | Description                                                          | Default Value              |
| ------------------ | ------- | -------------------------------------------------------------------- | -------------------------- |
| `applicationName`  | string  | Make the application your own by changing the name.                  | `"EMILE"`                  |
| `backgroundURL`    | string  | The path to login page's background image.                           | `"/images/background.jpg"` |
| `bigLogoURL`       | string  | The path to a custom logo for the login page.                        | `"/images/logo.svg"`       |
| `smallLogoURL`     | string  | The path to the in-application logo. Square shaped images work best. | `"/images/logo-small.svg"` |
| `httpPort`         | number  | The listening port for HTTP.                                         | `7000`                     |
| `maximumProcesses` | number  | The maximum number of web server processes.                          | `4`                        |
| `useTestDatabases` | boolean | Whether or not the test database should be used.                     | `false`                    |

### config.session = {}

| Property Name  | Type    | Description                                                                        | Default Value      |
| -------------- | ------- | ---------------------------------------------------------------------------------- | ------------------ |
| `cookieName`   | string  | The name of the session cookie.                                                    | `"emile-user-sid"` |
| `secret`       | string  | The secret used to sign the session cookie.                                        | `"cityssm/emile"`  |
| `maxAgeMillis` | number  | The session timeout in milliseconds.                                               | `3600000`          |
| `doKeepAlive`  | boolean | When `true`, the browser will ping the web application to keep the session active. | `false`            |

### config.reverseProxy = {}

| Property Name        | Type    | Description                                                      | Default Value |
| -------------------- | ------- | ---------------------------------------------------------------- | ------------- |
| `disableCompression` | boolean | Whether or not the EMILE application should disable compression. | `false`       |
| `disableEtag`        | boolean | Whether or not the EMILE application should disable etags.       | `false`       |
| `urlPrefix`          | string  | A folder name the application should run within.                 | `""`          |

## Authentication Settings

### config.activeDirectory = {}

See the configuration for [activedirectory2 on npm](https://www.npmjs.com/package/activedirectory2).
Not required if using `adWebAuthConfig`.

| Property Name | Type   | Sample Value             |
| ------------- | ------ | ------------------------ |
| `url`         | string | `"ldap://dc.domain.com"` |
| `baseDN`      | string | `"dc=domain,dc=com"`     |
| `userName`    | string | `"username@domain.com"`  |
| `password`    | string | `"p@ssword"`             |

### config.adWebAuthConfig = {}

For use connecting to an [ad-web-auth](https://github.com/cityssm/ad-web-auth) server.
Not required if using `activeDirectory`.

| Property Name   | Type   | Sample Value               |
| --------------- | ------ | -------------------------- |
| `url`           | string | `"https://ad.example.com"` |
| `method`        | string | `"post"`                   |
| `userNameField` | string | `"userName"`               |
| `password`      | string | `"password"`               |

### config.tempUsers = ConfigTemporaryUserCredentials[]

An array of temporary users that can log into EMILE.
These users should be used to set up permissions for proper Active Directory administrators.
Temporary users should no be used on an ongoing basis.

#### ConfigTemporaryUserCredentials

| Property Name    | Type    | Description                                                                           | Sample Value     |
| ---------------- | ------- | ------------------------------------------------------------------------------------- | ---------------- |
| `user.userName`  | string  | Temporary users must start with `~~`                                                  | `"~~tempUser"`   |
| `user.canLogin`  | boolean | Whether the temporary user has permission to log in or not.                           | `true`           |
| `user.canUpdate` | boolean | Whether the temporary user has permission to update data or not.                      | `false`          |
| `user.isAdmin`   | boolean | Whether the temporary user has permission to perform administrative functions or not. | `true`           |
| `password`       | string  | The password for the temporary user.                                                  | `"tempP@ssword"` |

## Data and Reporting Settings

### config.parserConfigs = Record<string, ConfigParserConfiguration>

At the time of this writing, `parserConfigs` are only used to define how CSV and Excel imports will be handled.

Configuration is best explained using a CSV export from Enbridge.
Note that configuration for Enbridge usage data CSV files exists in `parsers/sheetParserConfigs.js`
and can be imported into your configuration file.

The CSV file appears as follows.

| Account Number | Name     | Service Address | Invoice Date | Billed From | Billed To  | Billing Days | Meter Read | Read Type | Consumption M3 | ... |
| -------------- | -------- | --------------- | ------------ | ----------- | ---------- | ------------ | ---------- | --------- | -------------- | --- |
| 012301230123'  | JANE DOE | 123 TEST STREET | 08/18/2023   | 07/15/2023  | 08/16/2023 | 33           | 14725      | E         | 38             | ... |
| 012301230123'  | JANE DOE | 123 TEST STREET | 07/18/2023   | 06/16/2023  | 07/14/2023 | 29           | 14687      | A         | 51             | ... |
| 012301230123'  | JANE DOE | 123 TEST STREET | 06/19/2023   | 05/16/2023  | 06/15/2023 | 31           | 14636      | E         | 29             | ... |

The configuration to parse the file would be as follows.

```javascript
import { excelDateToDate } from '../parsers/parserTools.js'

config.parserConfigs.enbridgeUsageHistory = {
  parserClass: 'SheetParser',
  configName: 'Enbridge Usage History CSV',
  aliasTypeKey: 'accountNumber.gas',
  columns: {
    assetAlias: {
      dataType: 'function',
      dataFunction(dataObject) {
        let accountNumber = dataObject['Account Number']
        if (accountNumber.endsWith("'")) {
          accountNumber = accountNumber.slice(
            0,
            Math.max(0, accountNumber.length - 1)
          )
        }

        return accountNumber
      }
    },
    dataType: {
      serviceCategory: {
        dataType: 'value',
        dataValue: 'Gas'
      },
      unit: {
        dataType: 'value',
        dataValue: 'm3'
      },
      commodity: {
        dataType: 'value',
        dataValue: 'Natural Gas'
      }
    },
    timeSeconds: {
      dataType: 'function',
      dataFunction(dataObject) {
        const startDate = excelDateToDate(dataObject['Billed From'])

        let timeSeconds = Math.round(
          startDate.getTime() / 1000 + startDate.getTimezoneOffset() * 60
        )

        if (new Date(timeSeconds * 1000).getHours() !== 0) {
          timeSeconds += startDate.getTimezoneOffset() * 60
        }

        return timeSeconds
      }
    },
    durationSeconds: {
      dataType: 'function',
      dataFunction(dataObject) {
        return dataObject['Billing Days'] * 86_400
      }
    },
    dataValue: {
      dataType: 'function',
      dataFunction(dataObject) {
        return dataObject['Consumption M3'] ?? 0
      }
    }
  }
}
```

### config.subscriptions.greenButton = Record<string, ConfigGreenButtonSubscription>

Credentials for automatically downloading data using Green Button® Connect My Data (CMD).

Note that before you will be able to use Green Button® CMD with your utility company of choice,
you may need to register yourself with that utility as a third party.
The registration process and the data provided varies with each utility, so it may not work with your utility provider.

To see the list of tested utility companies, visit the
[Green Button® Subscriber for Node](https://github.com/cityssm/node-green-button-subscriber) project.

#### ConfigGreenButtonSubscription

| Property Name                | Type     | Description                                                 | Sample Value                         |
| ---------------------------- | -------- | ----------------------------------------------------------- | ------------------------------------ |
| `configuration.baseUrl`      | string   | The server URL, prior to `DataCustodian`.                   | `"https://utilityapi.com"`           |
| `configuration.clientId`     | string   | Required, with `clientSecret`, if `accessToken` is missing. | `"0123456789abcdef"`                 |
| `configuration.clientSecret` | string   | Required, eith `clientId`, if `accessToken` is missing.     | `"0123456789abcdef"`                 |
| `configuration.accessToken`  | string   | Required if `clientId` and `clientSecret` are missing.      | `"0123456789abcdef"`                 |
| `authorizationIdsToExclude`  | string[] | Authorization IDs that should be ignored.                   | `["TEST"]`                           |
| `pollingHoursToExclude`      | number[] | Hours of the day when polling should not take place.        | `[8, 9, 10, 11, 12, 13, 14, 15, 16]` |

## Other Settings

### config.settings = {}

| Property Name         | Type   | Description                                                                                          | Default Value |
| --------------------- | ------ | ---------------------------------------------------------------------------------------------------- | ------------- |
| `reportKeyAccessDays` | number | The number of days a user can use their report key from an IP address before having to log in again. | `5`           |

## Trademarks

® GREEN BUTTON is a registered trademark owned by Departments of the U.S. Government.
