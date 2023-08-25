import { excelDateToDate } from '../parsers/parserTools.js';
import baseConfig from './config.base.js';
export const config = Object.assign({}, baseConfig);
config.parserConfigs = config.parserConfigs ?? {};
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
            dataFunction: (dataObject) => {
                const startDate = excelDateToDate(dataObject.BillPeriodStart);
                return (startDate.getTime() / 1000) + (startDate.getTimezoneOffset() * 60);
            }
        },
        durationSeconds: {
            dataType: 'function',
            dataFunction: (dataObject) => {
                const startDate = excelDateToDate(dataObject.BillPeriodStart);
                const endDate = excelDateToDate(dataObject.BillPeriodEnd);
                return (endDate.getTime() - startDate.getTime()) / 1000;
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
};
export default config;
