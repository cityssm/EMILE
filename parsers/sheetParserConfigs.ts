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
