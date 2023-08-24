import path from 'node:path'

import Debug from 'debug'
import XLSX from 'xlsx'

import { getAssetByAssetAlias } from '../database/getAsset.js'
import { getAssetAliasTypeByAliasTypeKey } from '../database/getAssetAliasType.js'
import { getConfigProperty } from '../helpers/functions.config.js'
import type { ConfigParserDataField } from '../types/configTypes.js'

import { BaseParser } from './baseParser.js'
import { getAssetCategories } from '../database/getAssetCategories.js'
import { addAsset } from '../database/addAsset.js'
import { addAssetAlias } from '../database/addAssetAlias.js'

const debug = Debug('emile:parsers:sheetParser')

type DataValueType = string | number

function getDataFieldValue(
  row: Record<string, string | number>,
  dataField?: ConfigParserDataField<DataValueType>
): DataValueType | undefined {
  if (dataField !== undefined) {
    switch (dataField.dataType) {
      case 'value': {
        return dataField.dataValue
      }
      case 'objectKey': {
        return row[dataField.dataObjectKey]
      }
      case 'function': {
        return dataField.dataFunction(row)
      }
    }
  }
  return undefined
}

export interface SheetParserProperties {
  parserClass: 'SheetParser'
  parserConfig: ''
}

export class SheetParser extends BaseParser {
  static fileExtensions = ['csv', 'xls', 'xlsx']

  static parserUser: EmileUser = {
    userName: 'system.sheetParser',
    canLogin: true,
    canUpdate: true,
    isAdmin: false
  }

  async parseFile(): Promise<boolean> {
    const parserConfig =
      getConfigProperty('parserConfigs')?.[
        this.energyDataFile.parserProperties?.parserConfig ?? ''
      ]

    if (parserConfig === undefined) {
      throw new Error(
        `Parser config unavailable: ${
          this.energyDataFile.parserProperties?.parserConfig ?? ''
        }`
      )
    }

    let aliasTypeId = -1

    if (parserConfig.aliasTypeKey !== undefined) {
      const aliasType = getAssetAliasTypeByAliasTypeKey(
        parserConfig.aliasTypeKey
      )

      if (aliasType === undefined) {
        throw new Error(
          `aliasType unavailable for aliasTypeKey: ${parserConfig.aliasTypeKey}`
        )
      }

      aliasTypeId = aliasType.aliasTypeId
    }

    try {
      const workbook = XLSX.readFile(
        path.join(
          this.energyDataFile.systemFolderPath,
          this.energyDataFile.systemFileName
        ),
        {}
      )

      if (workbook.SheetNames.length > 0) {
        debug(
          `Multiple sheets, importing the first one: ${workbook.SheetNames[0]}`
        )
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]]

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        raw: true,
        rawNumbers: true
      }) as Array<Record<string, string | number>>

      for (const row of rows) {
        /*
         * Ensure an assetId is available
         */

        let assetId = this.energyDataFile.assetId

        if ((assetId ?? '') === '') {
          const assetAlias = getDataFieldValue(
            row,
            parserConfig.columns.assetAlias
          ) as string

          if (assetAlias === undefined) {
            throw new Error('No asset alias available.')
          }

          const asset = getAssetByAssetAlias(assetAlias, aliasTypeId)

          // Create asset
          if (asset === undefined) {
            const assetCategory = getAssetCategories()[0]

            if (assetCategory === undefined) {
              throw new Error(
                `Cannot create asset ${assetAlias} with no asset categories available.`
              )
            }

            assetId = addAsset(
              {
                assetName: assetAlias,
                categoryId: assetCategory.categoryId
              },
              SheetParser.parserUser
            )

            addAssetAlias(
              {
                assetId,
                aliasTypeId,
                assetAlias
              },
              SheetParser.parserUser
            )
          } else {
            assetId = asset.assetId
          }
        }
      }

      throw new Error('Parser not fully implemented')
    } catch (error) {
      this.handleParseFileError(error)
      return false
    }

    return true
  }
}
