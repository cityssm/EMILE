// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type { Asset, AssetCategory, AssetGroup } from './recordTypes.js'

export interface Emile {
  urlPrefix: string
  canUpdate: boolean

  getMapLink: (latitude: number, longitude: number) => string

  assets: Asset[]
  assetGroups: AssetGroup[]
  assetCategories: AssetCategory[]

  initializeAssetSelector: (
    initializeAssetSelectorOptions: InitializeAssetSelectorOptions
  ) => void

  setUnsavedChanges: () => void
  clearUnsavedChanges: () => void
  hasUnsavedChanges: () => boolean
}

export interface InitializeAssetSelectorOptions {
  assetSelectorElement: HTMLElement
  callbackFunction?: (
    selectedAssetOrAssetGroup?:
      | {
          type: 'asset'
          assetId: number
        }
      | {
          type: 'assetGroup'
          groupId: number
        }
      | { type: 'clear' }
  ) => void
}
