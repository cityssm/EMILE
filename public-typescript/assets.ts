// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Emile as EmileGlobal } from '../types/globalTypes.js'
import type { Asset, AssetCategory, AssetGroup } from '../types/recordTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const Emile = exports.Emile as EmileGlobal

  const assetCategories = exports.assetCategories as AssetCategory[]
  delete exports.assetCategories

  let assets = exports.assets as Asset[]
  delete exports.assets

  const assetFilterElement = document.querySelector(
    '#filter--assets'
  ) as HTMLInputElement

  function renderAssets(): void {
    const countElement = document.querySelector('#count--assets') as HTMLElement
    const containerElement = document.querySelector(
      '#container--assets'
    ) as HTMLElement

    if (assets.length === 0) {
      countElement.textContent = assets.length.toString()

      containerElement.innerHTML = `<div class="message is-warning">
        <p class="message-body">
          <strong>No Assets Found</strong><br />
          Get started by adding some assets that will be reported on.
        </p>
        </div>`

      return
    }

    const searchPieces = assetFilterElement.value
      .trim()
      .toLowerCase()
      .split(' ')

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped has-sticky-header'
    tableElement.innerHTML = `<thead><tr>
      <th>Asset</th>
      <th>Category</th>
      </tr></thead>
      <tbody></tbody>`

    // eslint-disable-next-line no-labels
    assetLoop: for (const asset of assets) {
      const searchText =
        asset.assetName.toLowerCase() +
        ' ' +
        (asset.category ?? '').toLowerCase()

      for (const searchPiece of searchPieces) {
        if (!searchText.includes(searchPiece)) {
          // eslint-disable-next-line no-labels
          continue assetLoop
        }
      }

      const rowElement = document.createElement('tr')

      rowElement.innerHTML = `<td>${asset.assetName}</td>
        <td>${asset.category ?? ''}</td>`
      ;(tableElement.querySelector('tbody') as HTMLTableSectionElement).append(
        rowElement
      )
    }

    const displayCount = tableElement.querySelectorAll('tbody tr').length

    countElement.textContent = displayCount.toString()

    if (displayCount === 0) {
      containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
          <strong>There are no assets that meet your search criteria.</strong><br />
          Try to be less specific in your search. 
        </p>
        </div>`
    } else {
      containerElement.innerHTML = ''
      containerElement.append(tableElement)
    }
  }

  document.querySelector('#button--addAsset')?.addEventListener('click', () => {
    let addAssetCloseModalFunction: () => void

    function doAddAsset(formEvent: SubmitEvent): void {
      formEvent.preventDefault()

    }

    cityssm.openHtmlModal('asset-add', {
      onshow(modalElement) {
        const categoryElement = modalElement.querySelector(
          '#assetAdd--categoryId'
        ) as HTMLSelectElement

        for (const category of assetCategories) {
          const optionElement = document.createElement('option')
          optionElement.value = category.categoryId?.toString() ?? ''
          optionElement.textContent = category.category
          categoryElement.append(optionElement)
        }
      },
      onshown(modalElement, closeModalFunction) {
        addAssetCloseModalFunction = closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddAsset)
      }
    })
  })

  let assetGroups = exports.assetGroups as AssetGroup[]
  delete exports.assetGroups

  /*
   * Initialize
   */

  // Initialize tabs
  bulmaJS.init()

  // Assets
  assetFilterElement.addEventListener('keyup', renderAssets)
  renderAssets()
})()
