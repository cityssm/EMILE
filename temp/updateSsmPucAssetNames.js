import fs from 'node:fs/promises';
import sqlite from 'better-sqlite3';
import papaparse from 'papaparse';
import { getAssetCategories } from '../database/getAssetCategories.js';
import { databasePath } from '../helpers/functions.database.js';
async function updateSsmPucAssetNames() {
    const csvBuffer = await fs.readFile('./temp/ssmPucAssets.csv');
    const assetRows = papaparse.parse(csvBuffer.toString(), {
        header: true,
        skipEmptyLines: true
    });
    const emileDB = sqlite(databasePath);
    const assetCategories = getAssetCategories(emileDB);
    for (const assetRow of assetRows.data) {
        const assetCategory = assetCategories.find((possibleCategory) => {
            return possibleCategory.category === assetRow.category.trim();
        });
        emileDB
            .prepare(`update Assets
          set categoryId = ?,
          assetName = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
          where recordDelete_timeMillis is null
          and (assetName = ? or assetName = ?)`)
            .run(assetCategory?.categoryId, assetRow.assetName.trim(), 'system.updateSsmPucAssetName', Date.now(), assetRow.accountNumber, `${assetRow.accountNumber}.0`);
    }
    emileDB.close();
}
await updateSsmPucAssetNames();
