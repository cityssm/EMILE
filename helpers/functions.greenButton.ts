// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import {
  helpers as greenButtonHelpers,
  type types as GreenButtonTypes
} from '@cityssm/green-button-parser'
import type sqlite from 'better-sqlite3'
import Debug from 'debug'

import { addAsset } from '../database/addAsset.js'
import { addAssetAlias } from '../database/addAssetAlias.js'
import { addEnergyData } from '../database/addEnergyData.js'
import { getAssetByAssetAlias } from '../database/getAsset.js'
import { getAssetAliasTypeByAliasTypeKey } from '../database/getAssetAliasType.js'
import { getEnergyDataPoint } from '../database/getEnergyData.js'
import { getEnergyDataTypeByGreenButtonIds } from '../database/getEnergyDataType.js'
import { updateEnergyDataValue } from '../database/updateEnergyData.js'
import type { EnergyDataType } from '../types/recordTypes.js'

import { getAssetCategories } from './functions.cache.js'
import { getConfigProperty } from './functions.config.js'
import { getConnectionWhenAvailable } from './functions.database.js'

const debug = Debug('emile:functions.greenButton')

const greenButtonAliasTypeKey = 'GreenButtonParser.IntervalBlock.link'

export const greenButtonAssetAliasType = await getAssetAliasTypeByAliasTypeKey(
  greenButtonAliasTypeKey
)

const greenButtonUser: EmileUser = {
  userName: 'system.greenButton',
  canLogin: true,
  canUpdate: true,
  isAdmin: false
}

async function getAssetIdFromAssetAlias(
  assetAlias: string,
  connectedEmileDB: sqlite.Database
): Promise<number> {
  let assetId: number

  debug(`assetAlias: ${assetAlias}`)

  const asset = await getAssetByAssetAlias(
    assetAlias,
    greenButtonAssetAliasType?.aliasTypeId,
    connectedEmileDB
  )

  // Create asset
  if (asset === undefined) {
    const assetCategories = await getAssetCategories()

    if (assetCategories.length === 0) {
      throw new Error(
        `Cannot create asset ${assetAlias} with no asset categories available.`
      )
    }

    assetId = await addAsset(
      {
        assetName: assetAlias,
        categoryId: assetCategories[0].categoryId
      },
      greenButtonUser,
      connectedEmileDB
    )

    await addAssetAlias(
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

async function getAssetIdFromIntervalBlock(
  intervalBlockEntry: GreenButtonTypes.GreenButtonEntryWithIntervalBlockContent,
  connectedEmileDB: sqlite.Database
): Promise<number> {
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

  return await getAssetIdFromAssetAlias(assetAlias, connectedEmileDB)
}

async function getAssetIdFromUsageSummary(
  usageSummaryEntry: GreenButtonTypes.GreenButtonEntryWithUsageSummaryContent,
  connectedEmileDB: sqlite.Database
): Promise<number> {
  let assetAlias = usageSummaryEntry.links.self ?? ''

  if (assetAlias === undefined) {
    throw new Error('No asset alias available on UsageSummary entry.')
  }

  if (assetAlias.includes('/UsageSummary/')) {
    assetAlias = assetAlias.slice(
      0,
      Math.max(0, assetAlias.indexOf('/UsageSummary/'))
    )
  }

  return await getAssetIdFromAssetAlias(assetAlias, connectedEmileDB)
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

  const usagePoint = greenButtonHelpers.getUsagePointEntryFromEntry(
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

async function getCurrencyDataType(
  greenButtonJson: GreenButtonTypes.GreenButtonJson,
  usageSummaryEntry: GreenButtonTypes.GreenButtonEntryWithUsageSummaryContent,
  connectedEmileDB: sqlite.Database
): Promise<undefined | EnergyDataType> {
  const usagePoint = greenButtonHelpers.getUsagePointEntryFromEntry(
    greenButtonJson,
    usageSummaryEntry
  )

  if (usagePoint === undefined) {
    throw new Error('Unable to find related UsagePoint entry.')
  }

  return await getEnergyDataTypeByGreenButtonIds(
    {
      serviceCategoryId:
        usagePoint.content.UsagePoint.ServiceCategory?.kind.toString() ?? '',
      unitId: `currency:${
        usageSummaryEntry.content.UsageSummary.currency?.toString() ?? ''
      }`,
      commodityId: usageSummaryEntry.content.UsageSummary.commodity?.toString()
    },
    greenButtonUser,
    true,
    connectedEmileDB
  )
}

async function getUsageDataType(
  greenButtonJson: GreenButtonTypes.GreenButtonJson,
  usageSummaryEntry: GreenButtonTypes.GreenButtonEntryWithUsageSummaryContent,
  connectedEmileDB: sqlite.Database
): Promise<undefined | EnergyDataType> {
  const usagePoint = greenButtonHelpers.getUsagePointEntryFromEntry(
    greenButtonJson,
    usageSummaryEntry
  )

  if (usagePoint === undefined) {
    throw new Error('Unable to find related UsagePoint entry.')
  }

  return await getEnergyDataTypeByGreenButtonIds(
    {
      serviceCategoryId:
        usagePoint.content.UsagePoint.ServiceCategory?.kind.toString() ?? '',
      unitId:
        usageSummaryEntry.content.UsageSummary.currentBillingPeriodOverAllConsumption?.uom?.toString() ??
        '',
      commodityId: usageSummaryEntry.content.UsageSummary.commodity?.toString()
    },
    greenButtonUser,
    true,
    connectedEmileDB
  )
}

export async function recordGreenButtonData(
  greenButtonJson: GreenButtonTypes.GreenButtonJson,
  options: {
    assetId?: number
    fileId?: number
  },
  connectedEmileDB?: sqlite.Database
): Promise<number> {
  let recordCount = 0

  const intervalBlockEntries =
    getConfigProperty('settings.greenButton.usageProperty') ===
    'intervalReading'
      ? greenButtonHelpers.getEntriesByContentType(
          greenButtonJson,
          'IntervalBlock'
        )
      : []

  const usageSummaryEntries = greenButtonHelpers.getEntriesByContentType(
    greenButtonJson,
    'UsageSummary'
  )

  if (intervalBlockEntries.length === 0 && usageSummaryEntries.length === 0) {
    throw new Error('File contains no IntervalBlock or UsageSummary entries.')
  }

  const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable())

  try {
    if (
      getConfigProperty('settings.greenButton.usageProperty') ===
      'intervalReading'
    ) {
      for (const intervalBlockEntry of intervalBlockEntries) {
        /*
         * Ensure an assetId is available
         */

        let assetId = options.assetId

        if ((assetId ?? '') === '') {
          assetId = await getAssetIdFromIntervalBlock(
            intervalBlockEntry,
            emileDB
          )
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

        if (energyDataTypeAndPower?.energyDataType === undefined) {
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
              const currentDataPoint = await getEnergyDataPoint(
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
                    dataTypeId:
                      energyDataTypeAndPower.energyDataType.dataTypeId,
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
                await updateEnergyDataValue(
                  {
                    dataId: currentDataPoint.dataId,
                    assetId: assetId as number,
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
    }

    for (const usageSummaryEntry of usageSummaryEntries) {
      /*
       * Ensure an assetId is available
       */

      let assetId = options.assetId

      if ((assetId ?? '') === '') {
        assetId = await getAssetIdFromUsageSummary(usageSummaryEntry, emileDB)
      }

      /*
       * Ensure a dataTypeId is available
       */

      const currencyDataType = await getCurrencyDataType(
        greenButtonJson,
        usageSummaryEntry,
        emileDB
      )

      if (currencyDataType === undefined) {
        throw new Error('Unable to retrieve EnergyDataType for currency.')
      }

      const currentDataPoint = await getEnergyDataPoint(
        {
          assetId: assetId as number,
          dataTypeId: currencyDataType.dataTypeId as number,
          timeSeconds:
            usageSummaryEntry.content.UsageSummary.billingPeriod.start,
          durationSeconds:
            usageSummaryEntry.content.UsageSummary.billingPeriod.duration
        },
        emileDB
      )

      const dataValue =
        (usageSummaryEntry.content.UsageSummary.billToDate ?? 0) / 100_000
      const powerOfTenMultiplier = 0

      if (currentDataPoint === undefined) {
        await addEnergyData(
          {
            assetId,
            dataTypeId: currencyDataType.dataTypeId,
            fileId: options.fileId,
            timeSeconds:
              usageSummaryEntry.content.UsageSummary.billingPeriod.start,
            durationSeconds:
              usageSummaryEntry.content.UsageSummary.billingPeriod.duration,
            dataValue,
            powerOfTenMultiplier
          },
          greenButtonUser,
          emileDB
        )

        recordCount += 1
      } else if (
        currentDataPoint.dataValue !== dataValue ||
        currentDataPoint.powerOfTenMultiplier !== powerOfTenMultiplier
      ) {
        await updateEnergyDataValue(
          {
            dataId: currentDataPoint.dataId,
            assetId: assetId as number,
            fileId: options.fileId,
            dataValue,
            powerOfTenMultiplier
          },
          greenButtonUser,
          emileDB
        )

        recordCount += 1
      }

      if (
        getConfigProperty('settings.greenButton.usageProperty') ===
        'currentBillingPeriodOverAllConsumption'
      ) {
        const usageDataType = await getUsageDataType(
          greenButtonJson,
          usageSummaryEntry,
          emileDB
        )

        if (usageDataType === undefined) {
          throw new Error('Unable to retrieve EnergyDataType for usage.')
        }

        const currentDataPoint = await getEnergyDataPoint(
          {
            assetId: assetId as number,
            dataTypeId: usageDataType.dataTypeId as number,
            timeSeconds:
              usageSummaryEntry.content.UsageSummary.billingPeriod.start,
            durationSeconds:
              usageSummaryEntry.content.UsageSummary.billingPeriod.duration
          },
          emileDB
        )

        const usageDataValue =
          usageSummaryEntry.content.UsageSummary
            .currentBillingPeriodOverAllConsumption?.value ?? 0
        const usagePowerOfTenMultiplier =
          usageSummaryEntry.content.UsageSummary
            .currentBillingPeriodOverAllConsumption?.powerOfTenMultiplier ?? '0'

        if (currentDataPoint === undefined) {
          await addEnergyData(
            {
              assetId,
              dataTypeId: usageDataType.dataTypeId,
              fileId: options.fileId,
              timeSeconds:
                usageSummaryEntry.content.UsageSummary.billingPeriod.start,
              durationSeconds:
                usageSummaryEntry.content.UsageSummary.billingPeriod.duration,
              dataValue: usageDataValue,
              powerOfTenMultiplier:
                typeof usagePowerOfTenMultiplier === 'string'
                  ? Number.parseInt(usagePowerOfTenMultiplier)
                  : usagePowerOfTenMultiplier
            },
            greenButtonUser,
            emileDB
          )

          recordCount += 1
        } else if (
          currentDataPoint.dataValue !== dataValue ||
          currentDataPoint.powerOfTenMultiplier !== powerOfTenMultiplier
        ) {
          await updateEnergyDataValue(
            {
              dataId: currentDataPoint.dataId,
              assetId: assetId as number,
              fileId: options.fileId,
              dataValue,
              powerOfTenMultiplier
            },
            greenButtonUser,
            emileDB
          )

          recordCount += 1
        }
      }
    }
  } finally {
    if (connectedEmileDB === undefined) {
      emileDB.close()
    }
  }

  return recordCount
}
