import { getConnectionWhenAvailable, getTempTableName } from '../helpers/functions.database.js';
import { getEnergyData, userFunction_getPowerOfTenMultiplierName } from './getEnergyData.js';
export async function getReportData(reportName, reportParameters = {}) {
    let sql = '';
    let header;
    let useTempTable = false;
    let useRaw = false;
    let runOptimizer = false;
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
            useTempTable = true;
            sql = 'select * from EnergyData';
            break;
        }
        case 'energyData-formatted-filtered': {
            const data = await getEnergyData({
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
            return {
                data
            };
        }
        case 'energyData-fullyJoined': {
            useTempTable = true;
            useRaw = true;
            runOptimizer = true;
            header = [
                'dataId',
                'serviceCategory',
                'category',
                'assetName',
                'startDateTime',
                'endDateTime',
                'dataValueEvaluated',
                'preferredPowerOfTenMultiplierName',
                'unit',
                'unitLong',
                'accumulationBehaviour',
                'commodity',
                'readingType',
                'latitude',
                'longitude',
                'recordCreate_timeMillis',
                'recordUpdate_timeMillis'
            ];
            sql = `select d.dataId,
        ts.serviceCategory,
        c.category,
        a.assetName,
        
        datetime(d.timeSeconds, 'unixepoch', 'localtime') as startDateTime,
        datetime(d.endTimeSeconds, 'unixepoch', 'localtime') as endDateTime,
          
        d.dataValue
          * power(10, d.powerOfTenMultiplier)
          / power(10, tu.preferredPowerOfTenMultiplier) as dataValueEvaluated,
          
        tu.preferredPowerOfTenMultiplierName,
        tu.unit, tu.unitLong,
          
        ta.accumulationBehaviour, tc.commodity, tr.readingType,

        a.latitude, a.longitude,
          
        d.recordCreate_timeMillis, d.recordUpdate_timeMillis
        
        from EnergyData d
        left join Assets a
          on d.assetId = a.assetId
        left join AssetCategories c
          on a.categoryId = c.categoryId
        left join EnergyDataTypes t
          on d.dataTypeId = t.dataTypeId
        left join EnergyServiceCategories ts
          on t.serviceCategoryId = ts.serviceCategoryId
        left join (
          select unitId, unit, unitLong, preferredPowerOfTenMultiplier,
          userFunction_getPowerOfTenMultiplierName(preferredPowerOfTenMultiplier) as preferredPowerOfTenMultiplierName
          from EnergyUnits
        ) tu on t.unitId = tu.unitId
        left join EnergyReadingTypes tr
          on t.readingTypeId = tr.readingTypeId
        left join EnergyCommodities tc
          on t.commodityId = tc.commodityId
        left join EnergyAccumulationBehaviours ta
          on t.accumulationBehaviourId = ta.accumulationBehaviourId

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
    emileDB.function('userFunction_getPowerOfTenMultiplierName', userFunction_getPowerOfTenMultiplierName);
    let resultRows = [];
    if (useTempTable) {
        const tempTableName = getTempTableName();
        emileDB.prepare(`create temp table ${tempTableName} as ${sql}`).run();
        let statement = emileDB.prepare(`select * from ${tempTableName}`);
        if (useRaw) {
            statement = statement.raw();
        }
        resultRows = statement.all();
    }
    else {
        resultRows = emileDB.prepare(sql).all();
    }
    if (runOptimizer) {
        emileDB.pragma('optimize');
    }
    emileDB.close();
    return {
        data: resultRows,
        header
    };
}
export default getReportData;
