import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getAssetCategories() {
    const emileDB = await getConnectionWhenAvailable();
    const statement = emileDB.prepare(`select categoryId, category, fontAwesomeIconClasses, orderNumber
      from AssetCategories
      where recordDelete_timeMillis is null
      order by orderNumber, category`);
    let expectedOrderNumber = -1;
    const assetCategories = [];
    for (const assetCategory of statement.iterate()) {
        expectedOrderNumber += 1;
        if (assetCategory.orderNumber !== expectedOrderNumber) {
            emileDB
                .prepare(`update AssetCategories
            set orderNumber = ?
            where categoryId = ?`)
                .run(expectedOrderNumber, assetCategory.categoryId);
            assetCategory.orderNumber = expectedOrderNumber;
        }
        assetCategories.push(assetCategory);
    }
    return assetCategories;
}
