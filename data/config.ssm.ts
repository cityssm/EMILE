import { dateStringToDate } from '@cityssm/utils-datetime'

import baseConfig from './config.base.js'

export const config = Object.assign({}, baseConfig)

config.parserConfigs = config.parserConfigs ?? {}

interface SsmPucRowData extends Record<string, unknown> {
  BillPeriodStart: string
  BillPeriodEnd: string
}

config.parserConfigs.ssmPuc = {
  parserClass: 'SheetParser',
  configName: 'SSM PUC Export',
  aliasTypeKey: 'accountNumber.electricity',
  columns: {
    assetAlias: {
      dataType: 'objectKey',
      dataObjectKey: 'account_no'
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
      dataFunction: (dataObject: SsmPucRowData) => {
        const startDate = dateStringToDate(dataObject.BillPeriodStart)
        return startDate.getTime() / 1000
      }
    },
    durationSeconds: {
      dataType: 'function',
      dataFunction: (dataObject: SsmPucRowData) => {
        const startDate = dateStringToDate(dataObject.BillPeriodStart)
        const endDate = dateStringToDate(dataObject.BillPeriodEnd)

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

export default config
