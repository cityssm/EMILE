// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type { AliasProperties } from './aliasTypePropertyTypes.js'

interface RecordUserNameDateTime {
  recordCreate_userName: string
  recordCreate_dateTime: Date | string

  recordUpdate_userName: string
  recordUpdate_dateTime: Date | string

  recordDelete_userName?: string
  recordDelete_dateTime?: Date
}

interface RecordOrderNumber {
  orderNumber: number
}

/*
 * Energy Interfaces
 */

interface RecordGreenButton {
  greenButtonId: string
}

export interface EnergyAccumulationBehaviour
  extends Partial<RecordUserNameDateTime>,
    Partial<RecordGreenButton>,
    Partial<RecordOrderNumber> {
  accumulationBehaviourId?: number
  accumulationBehaviour: string
}

export interface EnergyServiceCategory
  extends Partial<RecordUserNameDateTime>,
    Partial<RecordGreenButton>,
    Partial<RecordOrderNumber> {
  serviceCategoryId?: number
  serviceCategory: string
}

export interface EnergyUnit
  extends Partial<RecordUserNameDateTime>,
    Partial<RecordGreenButton>,
    Partial<RecordOrderNumber> {
  unitId?: number
  unit: string
  unitLong?: string
}

export interface EnergyReadingType
  extends Partial<RecordUserNameDateTime>,
    Partial<RecordGreenButton>,
    Partial<RecordOrderNumber> {
  readingTypeId?: number
  readingType: string
}

export interface EnergyCommodity
  extends Partial<RecordUserNameDateTime>,
    Partial<RecordGreenButton>,
    Partial<RecordOrderNumber> {
  commodityId?: number
  commodity: string
}

/*
 * Asset Interfaces
 */

export interface AssetCategory
  extends Partial<RecordUserNameDateTime>,
    Partial<RecordOrderNumber> {
  categoryId?: number
  category: string
  fontAwesomeIconClasses?: `fas fa-${string}` | `far fa-${string}`
}

export interface AssetAliasType
  extends Partial<RecordUserNameDateTime>,
    Partial<RecordOrderNumber> {
  aliasTypeId?: number
  aliasType: string
  regularExpression?: string

  aliasPropertiesJson?: string
  aliasProperties?: AliasProperties
}

export interface AssetAlias
  extends Partial<RecordUserNameDateTime>,
    Partial<AssetAliasType> {
  aliasId?: number
  assetId?: number
  assetAlias: string
}

export interface Asset
  extends Partial<RecordUserNameDateTime>,
    Partial<AssetCategory> {
  assetId?: number
  assetName: string
  latitude?: number | null
  longitude?: number | null
  assetAliases?: AssetAlias[]
}

export interface AssetGroup extends Partial<RecordUserNameDateTime> {
  groupId?: number
  groupName: string
  groupDescription: string
  isShared: boolean
  recordCreate_userName: string

  groupMembers?: Asset[]
  groupMemberCount?: number
}

/*
 * USER TYPES
 */

declare global {
  interface EmileUser extends Partial<RecordUserNameDateTime> {
    userName: string
    canLogin: boolean
    canUpdate: boolean
    isAdmin: boolean
  }
}

declare module 'express-session' {
  interface Session {
    user?: EmileUser
  }
}
