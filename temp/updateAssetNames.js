import sqlite from 'better-sqlite3';
import XLSX from 'xlsx';
import { getAssetAliasTypeByAliasTypeKey } from '../database/getAssetAliasType.js';
import { getAssetCategories } from '../database/getAssetCategories.js';
import { databasePath } from '../helpers/functions.database.js';
const updateUser = {
    userName: 'system.updateAssetName',
    canLogin: true,
    canUpdate: true,
    isAdmin: false
};
async function updateSsmPucAssetNames() {
    const workbook = XLSX.readFile('./temp/assetNames.xlsx', {});
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const assetRows = XLSX.utils.sheet_to_json(worksheet, {
        raw: true,
        rawNumbers: true
    });
    const assetCategories = getAssetCategories();
    const gasAccountNumberAlias = getAssetAliasTypeByAliasTypeKey('accountNumber.gas');
    const electricityAccountNumberAlias = getAssetAliasTypeByAliasTypeKey('accountNumber.electricity');
    const emileDB = sqlite(databasePath);
    for (const assetRow of assetRows) {
        const assetCategory = assetCategories.find((possibleCategory) => {
            return possibleCategory.category === assetRow.category.trim();
        });
        let hasUtilityApiAuthorizationNumber = false;
        if (assetRow.utilityApiAuthorizationNumber !== undefined &&
            assetRow.utilityApiAuthorizationNumber !== '') {
            hasUtilityApiAuthorizationNumber = true;
            emileDB
                .prepare(`update Assets
            set categoryId = ?,
            assetName = ?,
            recordUpdate_userName = ?,
            recordUpdate_timeMillis = ?
            where recordDelete_timeMillis is null
            and assetName like 'https://utilityapi.com/DataCustodian/espi/1_1/resource/Subscription/${assetRow.utilityApiAuthorizationNumber}/%'`)
                .run(assetCategory?.categoryId, assetRow.assetName.trim(), updateUser.userName, Date.now());
        }
    }
    emileDB.close();
}
await updateSsmPucAssetNames();
