import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { AssetCategory } from '../types/recordTypes.js'

export async function getAssetCategories(): Promise<AssetCategory[]> {
  const emileDB = await getConnectionWhenAvailable()

  const statement = emileDB.prepare(
    `select categoryId, category, fontAwesomeIconClasses, orderNumber
      from AssetCategories
      where recordDelete_timeMillis is null
      order by orderNumber, category`
  )

  let expectedOrderNumber = -1
  const assetCategories: AssetCategory[] = []

  for (const assetCategory of statement.iterate() as IterableIterator<AssetCategory>) {
    expectedOrderNumber += 1

    if (assetCategory.orderNumber !== expectedOrderNumber) {
      emileDB
        .prepare(
          `update AssetCategories
            set orderNumber = ?
            where categoryId = ?`
        )
        .run(expectedOrderNumber, assetCategory.categoryId)

      assetCategory.orderNumber = expectedOrderNumber
    }

    assetCategories.push(assetCategory)
  }

  return assetCategories
}
