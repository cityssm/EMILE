import fs from 'node:fs/promises'

import sqlite from 'better-sqlite3'
import papaparse from 'papaparse'

import { getAssetCategories } from '../database/getAssetCategories.js'
import { databasePath } from '../helpers/functions.database.js'

interface AssetRow {
  accountNumber: string
  category: string
  service: string
  assetName: string
}

async function updateSsmPucAssetNames(): Promise<void> {
  const csvBuffer = await fs.readFile('./temp/ssmPucAssets.csv')

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const assetRows = papaparse.parse(csvBuffer.toString(), {
    header: true,
    skipEmptyLines: true
  }) as papaparse.ParseResult<AssetRow>

  const assetCategories = getAssetCategories()

  const emileDB = sqlite(databasePath)

  for (const assetRow of assetRows.data) {
    const assetCategory = assetCategories.find((possibleCategory) => {
      return possibleCategory.category === assetRow.category.trim()
    })

    emileDB
      .prepare(
        `update Assets
          set categoryId = ?,
          assetName = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
          where recordDelete_timeMillis is null
          and (assetName = ? or assetName = ?)`
      )
      .run(
        assetCategory?.categoryId,
        assetRow.assetName.trim(),
        'system.updateSsmPucAssetName',
        Date.now(),
        assetRow.accountNumber,
        `${assetRow.accountNumber}.0`
      )
  }

  emileDB.close()
}

await updateSsmPucAssetNames()
