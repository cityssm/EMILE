import sqlite from 'better-sqlite3'
import XLSX from 'xlsx'

import { addAsset } from '../database/addAsset.js'
import { addAssetAlias } from '../database/addAssetAlias.js'
import { getAssetByAssetAlias } from '../database/getAsset.js'
import { getAssetAliasTypeByAliasTypeKey } from '../database/getAssetAliasType.js'
import { getAssetCategories } from '../database/getAssetCategories.js'
import { databasePath } from '../helpers/functions.database.js'

interface AssetRow {
  category: string
  assetName: string
  address: string
  accountNumberElectricity?: number | ''
  accountNumberGas?: string
  services: string
}

const updateUser = {
  userName: 'system.updateAssetName',
  canLogin: true,
  canUpdate: true,
  isAdmin: false
}

function updateSsmPucAssetNames(): void {
  const workbook = XLSX.readFile('./temp/assetNames.xlsx', {})

  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const assetRows = XLSX.utils.sheet_to_json(worksheet, {
    raw: true,
    rawNumbers: true
  }) as AssetRow[]

  const assetCategories = getAssetCategories()

  const gasAccountNumberAlias =
    getAssetAliasTypeByAliasTypeKey('accountNumber.gas')

  const electricityAccountNumberAlias = getAssetAliasTypeByAliasTypeKey(
    'accountNumber.electricity'
  )

  const emileDB = sqlite(databasePath)

  for (const assetRow of assetRows) {
    const assetCategory = assetCategories.find((possibleCategory) => {
      return possibleCategory.category === assetRow.category.trim()
    })

    let hasElectricityAccountNumber = false

    if (
      assetRow.accountNumberElectricity !== undefined &&
      assetRow.accountNumberElectricity !== ''
    ) {
      hasElectricityAccountNumber = true

      emileDB
        .prepare(
          `update Assets
            set categoryId = ?,
            assetName = ?,
            recordUpdate_userName = ?,
            recordUpdate_timeMillis = ?
            where recordDelete_timeMillis is null
            and assetName = ?`
        )
        .run(
          assetCategory?.categoryId,
          assetRow.assetName.trim(),
          updateUser.userName,
          Date.now(),
          assetRow.accountNumberElectricity.toString()
        )
    }

    if (
      assetRow.accountNumberGas !== undefined &&
      assetRow.accountNumberGas !== ''
    ) {
      let assetId: number

      const gasAccountNumber = assetRow.accountNumberGas.replace("'", '')

      if (hasElectricityAccountNumber) {
        const asset = getAssetByAssetAlias(
          assetRow.accountNumberElectricity?.toString() ?? '',
          electricityAccountNumberAlias?.aliasTypeId
        )

        if (asset !== undefined) {
          assetId = asset.assetId ?? 0
        }
      }

      if (assetId === undefined) {
        assetId = addAsset(
          {
            assetName: assetRow.assetName,
            categoryId: assetCategory?.categoryId
          },
          updateUser,
          emileDB
        )
      }

      addAssetAlias(
        {
          aliasTypeId: gasAccountNumberAlias?.aliasTypeId,
          assetId: assetId ?? 0,
          assetAlias: gasAccountNumber
        },
        updateUser,
        emileDB
      )
    }
  }

  emileDB.close()
}

updateSsmPucAssetNames()
