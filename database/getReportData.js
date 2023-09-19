import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { getEnergyData } from './getEnergyData.js';
export async function getReportData(reportName, reportParameters = {}) {
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
            return await getEnergyData({
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
        case 'energyData-fullyJoined': {
            sql = `select d.dataId,
          c.category,
          a.assetName, a.latitude, a.longitude,
          ts.serviceCategory,
          tu.unit, tu.unitLong,
          tr.readingType,
          tc.commodity,
          ta.accumulationBehaviour,
          datetime(d.timeSeconds, 'unixepoch', 'localtime') as startDateTime,
          datetime(d.endTimeSeconds, 'unixepoch', 'localtime') as endDateTime,
        
          d.dataValue * power(10, d.powerOfTenMultiplier) as dataValueEvaluated,
        
          d.dataValue,
          d.powerOfTenMultiplier,
        
          d.recordCreate_userName, d.recordCreate_timeMillis,
          d.recordUpdate_userName, d.recordUpdate_timeMillis,
          a.categoryId, a.assetId, d.dataTypeId, t.serviceCategoryId, t.unitId, t.readingTypeId, t.commodityId, t.accumulationBehaviourId,
          d.timeSeconds, d.durationSeconds
        
        from EnergyData d
        left join Assets a
          on d.assetId = a.assetId
        left join AssetCategories c
          on a.categoryId = c.categoryId
        left join EnergyDataTypes t
          on d.dataTypeId = t.dataTypeId
        left join EnergyServiceCategories ts
          on t.serviceCategoryId = ts.serviceCategoryId
        left join EnergyUnits tu
          on t.unitId = tu.unitId
        left join EnergyReadingTypes tr
          on t.readingTypeId = tr.readingTypeId
        left join EnergyCommodities tc
          on t.commodityId = tc.commodityId
        left join EnergyAccumulationBehaviours ta
          on t.accumulationBehaviourId = ta.accumulationBehaviourId
        left join EnergyDataFiles f
          on d.fileId = f.fileId
        where d.recordDelete_timeMillis is null
          and a.recordDelete_timeMillis is null`;
            break;
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
        default: {
            return undefined;
        }
    }
    const emileDB = await getConnectionWhenAvailable(true);
    const resultRows = emileDB.prepare(sql).all();
    emileDB.close();
    return resultRows;
}
export default getReportData;
