import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/functions.database.js';
export function getReportData(reportName, reportParameters = {}) {
    const emileDB = sqlite(databasePath);
    let sql = '';
    switch (reportName) {
        case 'assets-all': {
            sql = 'select * from Assets';
            break;
        }
        case 'assets-formatted': {
            sql = `select a.assetId, a.assetName,
        a.categoryId, c.category, c.fontAwesomeIconClasses
        from Assets a
        left join AssetCategories c on a.categoryId = c.categoryId
        where a.recordDelete_timeMillis is null
        order by a.assetName, c.category`;
            break;
        }
        default: {
            return undefined;
        }
    }
    const resultRows = emileDB.prepare(sql).all();
    emileDB.close();
    return resultRows;
}
export default getReportData;
