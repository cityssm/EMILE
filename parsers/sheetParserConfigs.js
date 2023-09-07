import { excelDateToDate } from './parserTools.js';
export const ssmPuc = {
    parserClass: 'SheetParser',
    configName: 'SSM PUC Export',
    aliasTypeKey: 'accountNumber.electricity',
    columns: {
        assetAlias: {
            dataType: 'function',
            dataFunction(dataObject) {
                return Math.round(dataObject.account_no).toString();
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
            dataFunction(dataObject) {
                const startDate = excelDateToDate(dataObject.BillPeriodStart);
                return startDate.getTime() / 1000 + startDate.getTimezoneOffset() * 60;
            }
        },
        durationSeconds: {
            dataType: 'function',
            dataFunction(dataObject) {
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
export const enbridgeUsageHistory = {
    parserClass: 'SheetParser',
    configName: 'Enbridge Usage History CSV',
    aliasTypeKey: 'accountNumber.gas',
    columns: {
        assetAlias: {
            dataType: 'function',
            dataFunction(dataObject) {
                let accountNumber = dataObject['Account Number'];
                if (accountNumber.slice(-1) === "'") {
                    accountNumber = accountNumber.slice(0, Math.max(0, accountNumber.length - 1));
                }
                return accountNumber;
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
                const startDate = excelDateToDate(dataObject['Billed From']);
                let timeSeconds = Math.round(startDate.getTime() / 1000 + startDate.getTimezoneOffset() * 60);
                if (new Date(timeSeconds * 1000).getHours() !== 0) {
                    timeSeconds += startDate.getTimezoneOffset() * 60;
                }
                return timeSeconds;
            }
        },
        durationSeconds: {
            dataType: 'function',
            dataFunction(dataObject) {
                return dataObject['Billing Days'] * 86400;
            }
        },
        dataValue: {
            dataType: 'function',
            dataFunction(dataObject) {
                return dataObject['Consumption M3'] ?? 0;
            }
        }
    }
};
