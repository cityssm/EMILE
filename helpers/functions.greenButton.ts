// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import {
  helpers as greenButtonHelpers,
  type types as GreenButtonTypes
} from '@cityssm/green-button-parser'
import sqlite from 'better-sqlite3'
import Debug from 'debug'

import { addAsset } from '../database/addAsset.js'
import { addAssetAlias } from '../database/addAssetAlias.js'
import { addEnergyData } from '../database/addEnergyData.js'
import { getAssetByAssetAlias } from '../database/getAsset.js'
import { getAssetAliasTypeByAliasTypeKey } from '../database/getAssetAliasType.js'
import { getEnergyDataPoint } from '../database/getEnergyData.js'
import { getEnergyDataTypeByGreenButtonIds } from '../database/getEnergyDataType.js'
import { updateEnergyDataValue } from '../database/updateEnergyData.js'
import { databasePath } from '../helpers/functions.database.js'
import type { EnergyDataType } from '../types/recordTypes.js'

import { getAssetCategories } from './functions.cache.js'

const debug = Debug('emile:functions.greenButton')

const greenButtonAliasTypeKey = 'GreenButtonParser.IntervalBlock.link'

export const greenButtonAssetAliasType = getAssetAliasTypeByAliasTypeKey(
  greenButtonAliasTypeKey
)

const greenButtonUser: EmileUser = {
  userName: 'system.greenButton',
  canLogin: true,
  canUpdate: true,
  isAdmin: false
}

async function getAssetIdFromIntervalBlock(
  intervalBlockEntry: GreenButtonTypes.GreenButtonEntryWithIntervalBlockContent,
  connectedEmileDB: sqlite.Database
): Promise<number> {
  let assetId: number

  let assetAlias = intervalBlockEntry.links.self ?? ''

  if (assetAlias === undefined) {
    throw new Error('No asset alias available on IntervalBlock entry.')
  }

  if (assetAlias.includes('/MeterReading/')) {
    assetAlias = assetAlias.slice(
      0,
      Math.max(0, assetAlias.indexOf('/MeterReading/'))
    )
  }

  debug(`assetAlias: ${assetAlias}`)

  const asset = await getAssetByAssetAlias(
    assetAlias,
    greenButtonAssetAliasType?.aliasTypeId,
    connectedEmileDB
  )

  // Create asset
  if (asset === undefined) {
    const assetCategory = getAssetCategories()[0]

    if (assetCategory === undefined) {
      throw new Error(
        `Cannot create asset ${assetAlias} with no asset categories available.`
      )
    }

    assetId = await addAsset(
      {
        assetName: assetAlias,
        categoryId: assetCategory.categoryId
      },
      greenButtonUser,
      connectedEmileDB
    )

    addAssetAlias(
      {
        assetId,
        aliasTypeId: greenButtonAssetAliasType?.aliasTypeId,
        assetAlias
      },
      greenButtonUser,
      connectedEmileDB
    )
  } else {
    assetId = asset.assetId as number
  }

  return assetId
}

async function getEnergyDataTypeAndPowerOfTenMultiplier(
  greenButtonJson: GreenButtonTypes.GreenButtonJson,
  intervalBlockEntry: GreenButtonTypes.GreenButtonEntryWithIntervalBlockContent,
  connectedEmileDB: sqlite.Database
): Promise<
  | undefined
  | {
      energyDataType?: EnergyDataType
      powerOfTenMultiplier: number
    }
> {
  const meterReadingEntry =
    greenButtonHelpers.getMeterReadingEntryFromIntervalBlockEntry(
      greenButtonJson,
      intervalBlockEntry
    )

  if (meterReadingEntry === undefined) {
    throw new Error('Unable to find related MeterReading entry.')
  }

  const readingType =
    greenButtonHelpers.getReadingTypeEntryFromMeterReadingEntry(
      greenButtonJson,
      meterReadingEntry
    )

  if (readingType === undefined) {
    throw new Error('Unable to find related ReadingType entry.')
  }

  const usagePoint = greenButtonHelpers.getUsagePointEntryFromMeterReadingEntry(
    greenButtonJson,
    meterReadingEntry
  )

  if (usagePoint === undefined) {
    throw new Error('Unable to find related UsagePoint entry.')
  }

  const powerOfTenMultiplier =
    readingType.content.ReadingType.powerOfTenMultiplier ?? '0'

  return {
    energyDataType: await getEnergyDataTypeByGreenButtonIds(
      {
        serviceCategoryId:
          usagePoint.content.UsagePoint.ServiceCategory?.kind.toString() ?? '',
        unitId: readingType.content.ReadingType.uom?.toString() ?? '',
        readingTypeId: readingType.content.ReadingType.kind?.toString(),
        commodityId: readingType.content.ReadingType.commodity?.toString(),
        accumulationBehaviourId:
          readingType.content.ReadingType.accumulationBehaviour?.toString()
      },
      greenButtonUser,
      true,
      connectedEmileDB
    ),
    powerOfTenMultiplier:
      typeof powerOfTenMultiplier === 'string'
        ? Number.parseInt(powerOfTenMultiplier, 10)
        : powerOfTenMultiplier
  }
}

export async function recordGreenButtonData(
  greenButtonJson: GreenButtonTypes.GreenButtonJson,
  options: {
    assetId?: number
    fileId?: number
  }
): Promise<number> {
  let recordCount = 0

  const intervalBlockEntries = greenButtonHelpers.getEntriesByContentType(
    greenButtonJson,
    'IntervalBlock'
  )

  if (intervalBlockEntries.length === 0) {
    throw new Error('File contains no IntervalBlock entries.')
  }

  let emileDB: sqlite.Database | undefined

  try {
    emileDB = sqlite(databasePath)

    for (const intervalBlockEntry of intervalBlockEntries) {
      /*
       * Ensure an assetId is available
       */

      let assetId = options.assetId

      if ((assetId ?? '') === '') {
        assetId = await getAssetIdFromIntervalBlock(intervalBlockEntry, emileDB)
      }

      /*
       * Ensure a dataTypeId is available
       */

      const energyDataTypeAndPower =
        await getEnergyDataTypeAndPowerOfTenMultiplier(
          greenButtonJson,
          intervalBlockEntry,
          emileDB
        )

      if (
        energyDataTypeAndPower === undefined ||
        energyDataTypeAndPower.energyDataType === undefined
      ) {
        throw new Error('Unable to retrieve EnergyDataType.')
      }

      /*
       * Loop through IntervalReadings
       */

      for (const intervalBlock of intervalBlockEntry.content.IntervalBlock) {
        for (const intervalReading of intervalBlock.IntervalReading ?? []) {
          if (
            intervalReading.timePeriod !== undefined &&
            intervalReading.value !== undefined
          ) {
            const currentDataPoint = getEnergyDataPoint(
              {
                assetId: assetId as number,
                dataTypeId: energyDataTypeAndPower.energyDataType
                  .dataTypeId as number,
                timeSeconds: intervalReading.timePeriod.start,
                durationSeconds: intervalReading.timePeriod.duration
              },
              emileDB
            )

            if (currentDataPoint === undefined) {
              await addEnergyData(
                {
                  assetId,
                  dataTypeId: energyDataTypeAndPower.energyDataType.dataTypeId,
                  fileId: options.fileId,
                  timeSeconds: intervalReading.timePeriod?.start,
                  durationSeconds: intervalReading.timePeriod?.duration,
                  dataValue: intervalReading.value,
                  powerOfTenMultiplier:
                    energyDataTypeAndPower.powerOfTenMultiplier
                },
                greenButtonUser,
                emileDB
              )

              recordCount += 1
            } else if (
              currentDataPoint.dataValue !== intervalReading.value ||
              currentDataPoint.powerOfTenMultiplier !==
                energyDataTypeAndPower.powerOfTenMultiplier
            ) {
              updateEnergyDataValue(
                {
                  dataId: currentDataPoint.dataId,
                  fileId: options.fileId,
                  dataValue: intervalReading.value,
                  powerOfTenMultiplier:
                    energyDataTypeAndPower.powerOfTenMultiplier
                },
                greenButtonUser,
                emileDB
              )

              recordCount += 1
            }
          }
        }
      }
    }
  } finally {
    if (emileDB !== undefined) {
      emileDB.close()
    }
  }

  return recordCount
}
