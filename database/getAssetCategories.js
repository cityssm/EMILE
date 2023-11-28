import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getAssetCategories() {
    const emileDB = await getConnectionWhenAvailable();
    const assetCategories = emileDB
        .prepare(`select categoryId, category, fontAwesomeIconClasses, orderNumber
        from AssetCategories
        where recordDelete_timeMillis is null
        order by orderNumber, category`)
        .all();
    let expectedOrderNumber = -1;
    for (const assetCategory of assetCategories) {
        expectedOrderNumber += 1;
        if (assetCategory.orderNumber !== expectedOrderNumber) {
            emileDB
                .prepare(`update AssetCategories
            set orderNumber = ?
            where categoryId = ?`)
                .run(expectedOrderNumber, assetCategory.categoryId);
        }
    }
    return assetCategories;
}
