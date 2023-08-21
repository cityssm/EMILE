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
        case 'energyData-formatted-filtered': {
            return getEnergyData({
                assetId: reportParameters.assetId,
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
