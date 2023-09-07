import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
import { getEnergyData } from './getEnergyData.js';
export function getReportData(reportName, reportParameters = {}) {
    let sql = '';
    switch (reportName) {
        case 'assets-all': {
            sql = 'select * from Assets';
            break;
        }
        case 'assets-formatted': {
            sql = `select a.assetId, a.assetName,
        a.categoryId, c.category
        from Assets a
        left join AssetCategories c on a.categoryId = c.categoryId
        where a.recordDelete_timeMillis is null
        order by a.assetName, c.category`;
            break;
        }
        case 'assetAliases-all': {
            sql = 'select * from AssetAliases';
            break;
        }
        case 'assetGroups-all': {
            sql = 'select * from AssetGroups';
            break;
        }
        case 'assetGroupMembers-all': {
            sql = 'select * from AssetGroupMembers';
            break;
        }
        case 'assetCategories-all': {
            sql = 'select * from AssetCategories';
            break;
        }
        case 'assetAliasTypes-all': {
            sql = 'select * from AssetAliasTypes';
            break;
        }
        case 'energyData-all': {
            sql = 'select * from EnergyData';
            break;
        }
        case 'energyData-formatted-filtered': {
            return getEnergyData({
                assetId: reportParameters.assetId,
                categoryId: reportParameters.categoryId,
                groupId: reportParameters.groupId,
                dataTypeId: reportParameters.dataTypeId,
                fileId: reportParameters.fileId,
                startDateString: reportParameters.startDateString,
                endDateString: reportParameters.endDateString,
                timeSecondsMin: reportParameters.timeSecondsMin,
                timeSecondsMax: reportParameters.timeSecondsMax
            }, {
                formatForExport: true
            });
        }
        case 'energyDataFiles-all': {
            sql = 'select * from EnergyDataFiles';
            break;
        }
        case 'energyAccumulationBehaviours-all': {
            sql = 'select * from EnergyAccumulationBehaviours';
            break;
        }
        case 'energyCommodities-all': {
            sql = 'select * from EnergyCommodities';
            break;
        }
        case 'energyDataTypes-all': {
            sql = 'select * from EnergyDataTypes';
            break;
        }
        case 'energyReadingTypes-all': {
            sql = 'select * from EnergyReadingTypes';
            break;
        }
        case 'energyServiceCategories-all': {
            sql = 'select * from EnergyServiceCategories';
            break;
        }
        case 'energyUnits-all': {
            sql = 'select * from EnergyUnits';
            break;
        }
        case 'users-all': {
            sql = 'select * from Users';
            break;
        }
        default: {
            return undefined;
        }
    }
    const emileDB = sqlite(databasePath, {
        readonly: true
    });
    const resultRows = emileDB.prepare(sql).all();
    emileDB.close();
    return resultRows;
}
export default getReportData;
