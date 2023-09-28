import sqlite from 'better-sqlite3';
import XLSX from 'xlsx';
import { addAssetAlias } from '../database/addAssetAlias.js';
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
    const addressAlias = getAssetAliasTypeByAliasTypeKey('civicAddress');
    const gasAccountNumberAlias = getAssetAliasTypeByAliasTypeKey('accountNumber.gas');
    const electricityAccountNumberAlias = getAssetAliasTypeByAliasTypeKey('accountNumber.electricity');
    const emileDB = sqlite(databasePath);
    for (const assetRow of assetRows) {
        const assetCategory = assetCategories.find((possibleCategory) => {
            return possibleCategory.category === assetRow.category.trim();
        });
        if ((assetRow.utilityApiAuthorizationNumber ?? '') !== '') {
            const utilityApiUrlLike = `https://utilityapi.com/DataCustodian/espi/1_1/resource/Subscription/${assetRow.utilityApiAuthorizationNumber}/%`;
            const result = emileDB
                .prepare(`update Assets
            set categoryId = ?,
            assetName = ?,
            recordUpdate_userName = ?,
            recordUpdate_timeMillis = ?
            where recordDelete_timeMillis is null
            and assetName like '${utilityApiUrlLike}'`)
                .run(assetCategory?.categoryId, assetRow.assetName.trim(), updateUser.userName, Date.now());
            if (result.changes > 0) {
                const asset = emileDB
                    .prepare(`select assetId from AssetAliases
              where assetAlias like '${utilityApiUrlLike}'`)
                    .get();
                if ((assetRow.address ?? '') !== '') {
                    addAssetAlias({
                        assetId: asset.assetId,
                        aliasTypeId: addressAlias?.aliasTypeId,
                        assetAlias: assetRow.address
                    }, updateUser, emileDB);
                }
                if ((assetRow.accountNumberElectricity ?? '') !== '') {
                    addAssetAlias({
                        assetId: asset.assetId,
                        aliasTypeId: electricityAccountNumberAlias?.aliasTypeId,
                        assetAlias: (assetRow.accountNumberElectricity ?? 0).toString()
                    }, updateUser, emileDB);
                }
                if ((assetRow.accountNumberGas ?? '') !== '') {
                    addAssetAlias({
                        assetId: asset.assetId,
                        aliasTypeId: gasAccountNumberAlias?.aliasTypeId,
                        assetAlias: assetRow.accountNumberGas
                    }, updateUser, emileDB);
                }
            }
        }
    }
    emileDB.close();
}
await updateSsmPucAssetNames();
