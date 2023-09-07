import type { ConfigParserConfiguration } from '../types/configTypes.js'

import { excelDateToDate } from './parserTools.js'

interface SsmPucRowData extends Record<string, unknown> {
  account_no: number
  BillPeriodStart: number
  BillPeriodEnd: number
}

export const ssmPuc: ConfigParserConfiguration = {
  parserClass: 'SheetParser',
  configName: 'SSM PUC Export',
  aliasTypeKey: 'accountNumber.electricity',
  columns: {
    assetAlias: {
      dataType: 'function',
      dataFunction(dataObject: SsmPucRowData) {
        return Math.round(dataObject.account_no).toString()
      }
    },
    dataType: {
      serviceCategory: {
        dataType: 'value',
        dataValue: 'Electricity'
      },
      unit: {
        dataType: 'value',
        dataValue: 'Wh'
      }
    },
    timeSeconds: {
      dataType: 'function',
      dataFunction(dataObject: SsmPucRowData) {
        const startDate = excelDateToDate(dataObject.BillPeriodStart)
        return startDate.getTime() / 1000 + startDate.getTimezoneOffset() * 60
      }
    },
    durationSeconds: {
      dataType: 'function',
      dataFunction(dataObject: SsmPucRowData) {
        const startDate = excelDateToDate(dataObject.BillPeriodStart)
        const endDate = excelDateToDate(dataObject.BillPeriodEnd)

        return (endDate.getTime() - startDate.getTime()) / 1000
      }
    },
    dataValue: {
      dataType: 'objectKey',
      dataObjectKey: 'ElectricMeteredUsage'
    },
    powerOfTenMultiplier: {
      dataType: 'value',
      dataValue: 3
    }
  }
}

interface EnbridgeUsageHistoryRowData extends Record<string, unknown> {
  'Account Number': string
  'Billed From': number
  'Billed To': number
  'Billing Days': number
  'Consumption M3': number
}

export const enbridgeUsageHistory: ConfigParserConfiguration = {
  parserClass: 'SheetParser',
  configName: 'Enbridge Usage History CSV',
  aliasTypeKey: 'accountNumber.gas',
  columns: {
    assetAlias: {
      dataType: 'function',
      dataFunction(dataObject: EnbridgeUsageHistoryRowData) {
        let accountNumber = dataObject['Account Number']
        if (accountNumber.slice(-1) === "'") {
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
      dataFunction(dataObject: EnbridgeUsageHistoryRowData) {
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
      dataFunction(dataObject: EnbridgeUsageHistoryRowData) {
        return dataObject['Billing Days'] * 86_400
      }
    },
    dataValue: {
      dataType: 'function',
      dataFunction(dataObject: EnbridgeUsageHistoryRowData) {
        return dataObject['Consumption M3'] ?? 0
      }
    }
  }
}
