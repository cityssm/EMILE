// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  Emile as EmileGlobal,
  InitializeAssetSelectorOptions
} from '../types/globalTypes.js'
import type { Asset, AssetGroup } from '../types/recordTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const mainElement = document.querySelector('main') as HTMLElement

  const urlPrefix = mainElement.dataset.urlPrefix ?? ''
  const canUpdate = mainElement.dataset.canUpdate === 'true'

  /*
   * Unsaved Changes
   */

  let _hasUnsavedChanges = false

  function setUnsavedChanges(): void {
    if (!hasUnsavedChanges()) {
      _hasUnsavedChanges = true
      cityssm.enableNavBlocker()
    }
  }

  function clearUnsavedChanges(): void {
    _hasUnsavedChanges = false
    cityssm.disableNavBlocker()
  }

  function hasUnsavedChanges(): boolean {
    return _hasUnsavedChanges
  }

  /*
   * Map Link
   */

  function getMapLink(latitude: number, longitude: number): string {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  }

  /*
   * Asset Selector
   */

  function initializeAssetSelector(
    assetSelectorOptions: InitializeAssetSelectorOptions
  ): void {
    let assetSelectorCloseModalFunction: () => void

    let assetFilterElement: HTMLInputElement
    let assetContainerElement: HTMLElement

    let assetGroupFilterElement: HTMLInputElement
    let assetGroupContainerElement: HTMLElement

    const iconContainerElement =
      assetSelectorOptions.assetSelectorElement.querySelector(
        '.icon'
      ) as HTMLElement

    const buttonElement =
      assetSelectorOptions.assetSelectorElement.querySelector(
        'button'
      ) as HTMLButtonElement

    /*
     * Load assets
     */

    const assetIdElement =
      assetSelectorOptions.assetSelectorElement.querySelector(
        'input[name="assetId"]'
      ) as HTMLInputElement
    const allowAssetSelect = assetIdElement !== null

    /*
     * Load asset groups
     */

    const groupIdElement =
      assetSelectorOptions.assetSelectorElement.querySelector(
        'input[name="groupId"]'
      ) as HTMLInputElement
    const allowGroupSelect = groupIdElement !== null

    /*
     * Functions
     */

    function selectAsset(clickEvent: Event): void {
      clickEvent.preventDefault()

      const assetId = Number.parseInt(
        (clickEvent.currentTarget as HTMLElement).dataset.assetId ?? '',
        10
      )

      const asset = Emile.assets.find((possibleAsset) => {
        return possibleAsset.assetId === assetId
      }) as Asset

      if (allowGroupSelect) {
        groupIdElement.value = ''
      }

      assetIdElement.value = asset.assetId?.toString() ?? ''

      iconContainerElement.innerHTML = `<i class="${
        asset.fontAwesomeIconClasses ?? 'fas fa-bolt'
      }" aria-hidden="true"></i>`

      buttonElement.textContent = asset.assetName

      assetSelectorCloseModalFunction()

      if (assetSelectorOptions.callbackFunction !== undefined) {
        assetSelectorOptions.callbackFunction({
          type: 'asset',
          assetId
        })
      }
    }

    function renderAssets(): void {
      const panelElement = document.createElement('div')
      panelElement.className = 'panel'

      const searchPieces = assetFilterElement.value
        .trim()
        .toLowerCase()
        .split(' ')

      // eslint-disable-next-line no-labels
      assetLoop: for (const asset of Emile.assets) {
        const assetSearchString = `${asset.assetName} ${
          asset.category ?? ''
        }`.toLowerCase()

        for (const searchPiece of searchPieces) {
          if (!assetSearchString.includes(searchPiece)) {
            // eslint-disable-next-line no-labels
            continue assetLoop
          }
        }

        const panelBlockElement = document.createElement('a')
        panelBlockElement.className = 'panel-block is-block'
        panelBlockElement.href = '#'
        panelBlockElement.dataset.assetId = asset.assetId?.toString()

        panelBlockElement.innerHTML = `<strong data-field="assetName"></strong><br />
          <i class="${
            asset.fontAwesomeIconClasses ?? 'fas fa-bolt'
          }" aria-hidden="true"></i> <span class="is-size-7" data-field="category"></span>`
        ;(
          panelBlockElement.querySelector(
            '[data-field="category"]'
          ) as HTMLElement
        ).textContent = asset.category ?? ''
        ;(
          panelBlockElement.querySelector(
            '[data-field="assetName"]'
          ) as HTMLElement
        ).textContent = asset.assetName

        panelBlockElement.addEventListener('click', selectAsset)

        panelElement.append(panelBlockElement)
      }

      if (panelElement.hasChildNodes()) {
        assetContainerElement.innerHTML = ''
        assetContainerElement.append(panelElement)
      } else {
        assetContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">
            There are no assets that meet your search criteria.
          </p>
          </div>`
      }
    }

    function selectAssetGroup(clickEvent: Event): void {
      clickEvent.preventDefault()

      const groupId = Number.parseInt(
        (clickEvent.currentTarget as HTMLElement).dataset.groupId ?? '',
        10
      )

      const assetGroup = Emile.assetGroups.find((possibleAssetGroup) => {
        return possibleAssetGroup.groupId === groupId
      }) as AssetGroup

      if (allowAssetSelect) {
        assetIdElement.value = ''
      }

      groupIdElement.value = assetGroup.groupId?.toString() ?? ''

      iconContainerElement.innerHTML =
        '<i class="fas fa-city" aria-hidden="true"></i>'

      buttonElement.textContent = assetGroup.groupName

      assetSelectorCloseModalFunction()

      if (assetSelectorOptions.callbackFunction !== undefined) {
        assetSelectorOptions.callbackFunction({
          type: 'assetGroup',
          groupId
        })
      }
    }

    function renderAssetGroups(): void {
      const panelElement = document.createElement('div')
      panelElement.className = 'panel'

      const searchPieces = assetGroupFilterElement.value
        .trim()
        .toLowerCase()
        .split(' ')

      // eslint-disable-next-line no-labels
      assetGroupLoop: for (const assetGroup of Emile.assetGroups) {
        const assetGroupSearchString = `${assetGroup.groupName} ${
          assetGroup.groupDescription ?? ''
        }`.toLowerCase()

        for (const searchPiece of searchPieces) {
          if (!assetGroupSearchString.includes(searchPiece)) {
            // eslint-disable-next-line no-labels
            continue assetGroupLoop
          }
        }

        const panelBlockElement = document.createElement('a')
        panelBlockElement.className = 'panel-block is-block'
        panelBlockElement.href = '#'
        panelBlockElement.dataset.groupId = assetGroup.groupId?.toString()

        panelBlockElement.innerHTML = `<i class="fas fa-city" aria-hidden="true"></i>
          <strong data-field="groupName"></strong><br />
          <span class="is-size-7" data-field="groupDescription"></span>`
        ;(
          panelBlockElement.querySelector(
            '[data-field="groupName"]'
          ) as HTMLElement
        ).textContent = assetGroup.groupName ?? ''
        ;(
          panelBlockElement.querySelector(
            '[data-field="groupDescription"]'
          ) as HTMLElement
        ).textContent = assetGroup.groupDescription

        panelBlockElement.addEventListener('click', selectAssetGroup)

        panelElement.append(panelBlockElement)
      }

      if (panelElement.hasChildNodes()) {
        assetGroupContainerElement.innerHTML = ''
        assetGroupContainerElement.append(panelElement)
      } else {
        assetGroupContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">
            There are no asset groups that meet your search criteria.
          </p>
          </div>`
      }
    }

    /*
     * Initialize button
     */

    buttonElement?.addEventListener('click', () => {
      cityssm.openHtmlModal('asset-select', {
        onshow(modalElement) {
          assetFilterElement = modalElement.querySelector(
            '#assetSelector--assetFilter'
          ) as HTMLInputElement

          assetContainerElement = modalElement.querySelector(
            '#assetSelectorContainer--assets'
          ) as HTMLElement

          assetGroupFilterElement = modalElement.querySelector(
            '#assetSelector--assetGroupFilter'
          ) as HTMLInputElement

          assetGroupContainerElement = modalElement.querySelector(
            '#assetSelectorContainer--assetGroups'
          ) as HTMLElement

          if (!allowAssetSelect || !allowGroupSelect) {
            // Remove Tabs
            modalElement.querySelector('.tabs')?.remove()
          } else {
            bulmaJS.init(modalElement)
          }

          if (!allowAssetSelect) {
            // Remove Asset Tab Container
            modalElement.querySelector('#assetSelectorTab--assets')?.remove()

            // Show Asset Groups Tab Container
            modalElement
              .querySelector('#assetSelectorTab--assetGroups')
              ?.classList.remove('is-hidden')
            ;(
              modalElement.querySelector('.modal-card-title') as HTMLElement
            ).textContent = 'Select an Asset Group'
          }
        },
        onshown(modalElement, closeModalFunction) {
          assetSelectorCloseModalFunction = closeModalFunction

          bulmaJS.toggleHtmlClipped()

          bulmaJS.init(modalElement)

          if (allowAssetSelect) {
            renderAssets()
            assetFilterElement.addEventListener('keyup', renderAssets)
          }

          if (allowGroupSelect) {
            renderAssetGroups()
            assetGroupFilterElement.addEventListener('keyup', renderAssetGroups)
          }
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })
  }

  /*
   * Build Global
   */

  const Emile: EmileGlobal = {
    urlPrefix,
    canUpdate,

    getMapLink,

    initializeAssetSelector,
    assets: [],
    assetGroups: [],
    assetCategories: [],

    setUnsavedChanges,
    clearUnsavedChanges,
    hasUnsavedChanges
  }

  // eslint-disable-next-line unicorn/prefer-module
  exports.Emile = Emile
})()
