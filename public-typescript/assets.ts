// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  Asset,
  AssetAlias,
  AssetAliasType,
  AssetGroup
} from '../types/recordTypes.js'

import type { Emile as EmileGlobal } from './globalTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal

interface ErrorResponse {
  success: false
  errorMessage?: string
}

;(() => {
  const Emile = exports.Emile as EmileGlobal

  const assetAliasTypes = exports.assetAliasTypes as AssetAliasType[]

  /*
   * Assets
   */

  type AssetAliasesResponseJSON =
    | {
        success: true
        assetAliases: AssetAlias[]
      }
    | {
        success: false
        errorMessage?: string
      }

  const assetCategoryFilterElement = document.querySelector(
    '#filter--categoryId'
  ) as HTMLSelectElement

  const assetFilterElement = document.querySelector(
    '#filter--assets'
  ) as HTMLInputElement

  function deleteAssetAlias(clickEvent: Event): void {
    const rowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const aliasId = rowElement.dataset.aliasId
    const assetId = rowElement.dataset.assetId

    function doDelete(): void {
      cityssm.postJSON(
        Emile.urlPrefix + '/assets/doDeleteAssetAlias',
        {
          aliasId,
          assetId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as AssetAliasesResponseJSON

          if (responseJSON.success) {
            renderAssetAliases(responseJSON.assetAliases)
          } else {
            bulmaJS.alert({
              title: 'Error Deleting Alias',
              message: responseJSON.errorMessage ?? 'Please try again.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete Asset Alias',
      message: 'Are you sure you want to remove this asset alias?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Remove Alias',
        callbackFunction: doDelete
      }
    })
  }

  function renderAssetAliases(assetAliases: AssetAlias[]): void {
    const tbodyElement = document.querySelector(
      '.modal #tbody--assetAliases'
    ) as HTMLTableSectionElement

    tbodyElement.innerHTML = ''

    for (const assetAlias of assetAliases) {
      const rowElement = document.createElement('tr')
      rowElement.dataset.aliasId = assetAlias.aliasId.toString()
      rowElement.dataset.assetId = assetAlias.assetId.toString()

      rowElement.innerHTML = `<td data-field="aliasType"></td>
        <td data-field="assetAlias"></td>
        <td>
          ${
            Emile.canUpdate
              ? `<button class="button is-danger is-delete-button" type="button">
                  <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
                  <span>Delete Alias</span>
                  </button>`
              : ''
          }
        </td>`
      ;(
        rowElement.querySelector('[data-field="aliasType"]') as HTMLElement
      ).textContent = assetAlias.aliasType ?? ''
      ;(
        rowElement.querySelector('[data-field="assetAlias"]') as HTMLElement
      ).textContent = assetAlias.assetAlias ?? ''

      rowElement
        .querySelector('.is-delete-button')
        ?.addEventListener('click', deleteAssetAlias)

      tbodyElement.append(rowElement)
    }
  }

  function populateAssetModal(
    modalElement: HTMLElement,
    assetId: string
  ): void {
    cityssm.postJSON(
      Emile.urlPrefix + '/assets/doGetAsset',
      {
        assetId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as
          | {
              success: true
              asset: Asset
            }
          | ErrorResponse

        if (!responseJSON.success) {
          bulmaJS.alert({
            title: 'Error Loading Asset Details',
            message: 'Please refresh the page and try again.',
            contextualColorName: 'danger'
          })
          return
        }

        /*
         * Asset Details Tab
         */

        ;(
          modalElement.querySelector('#assetView--assetId') as HTMLInputElement
        ).value = responseJSON.asset.assetId?.toString() ?? ''
        ;(
          modalElement.querySelector(
            '.modal-card-head [data-field="assetName"]'
          ) as HTMLElement
        ).textContent = responseJSON.asset.assetName

        const categoryElement = modalElement.querySelector(
          '#assetView--categoryId'
        ) as HTMLSelectElement

        let categoryFound = false

        if (Emile.canUpdate) {
          for (const category of Emile.assetCategories) {
            const optionElement = document.createElement('option')

            optionElement.value = category.categoryId?.toString() ?? ''
            optionElement.textContent = category.category

            if (category.categoryId === responseJSON.asset.categoryId) {
              optionElement.selected = true
              categoryFound = true
            }
            categoryElement.append(optionElement)
          }
        }

        if (!categoryFound) {
          const optionElement = document.createElement('option')
          optionElement.value = responseJSON.asset.categoryId?.toString() ?? ''
          optionElement.textContent = responseJSON.asset.category ?? ''
          optionElement.selected = true
          categoryElement.append(optionElement)
        }

        ;(
          modalElement.querySelector(
            '#assetView--assetName'
          ) as HTMLInputElement
        ).value = responseJSON.asset.assetName
        ;(
          modalElement.querySelector('#assetView--latitude') as HTMLInputElement
        ).value = responseJSON.asset.latitude?.toFixed(6) ?? ''
        ;(
          modalElement.querySelector(
            '#assetView--longitude'
          ) as HTMLInputElement
        ).value = responseJSON.asset.longitude?.toFixed(6) ?? ''

        /*
         * Asset Aliases Tabs
         */

        renderAssetAliases(responseJSON.asset.assetAliases ?? [])
      }
    )
  }

  function updateAsset(formEvent: Event): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      Emile.urlPrefix + '/assets/doUpdateAsset',
      formEvent.currentTarget,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as
          | {
              success: true
              assets: Asset[]
            }
          | ErrorResponse

        if (responseJSON.success) {
          Emile.assets = responseJSON.assets

          bulmaJS.alert({
            message: 'Asset updated successfully.',
            contextualColorName: 'success'
          })

          renderAssets()
        } else {
          bulmaJS.alert({
            title: 'Error Updating Asset',
            message: responseJSON.errorMessage ?? 'Please try again.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function addAssetAlias(formEvent: Event): void {
    formEvent.preventDefault()

    const formElement = formEvent.currentTarget as HTMLFormElement

    cityssm.postJSON(
      Emile.urlPrefix + '/assets/doAddAssetAlias',
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as AssetAliasesResponseJSON

        if (responseJSON.success) {
          renderAssetAliases(responseJSON.assetAliases)
          formElement.reset()
        } else {
          bulmaJS.alert({
            title: 'Error Adding Alias',
            message: responseJSON.errorMessage ?? 'Please try again.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function openAssetByAssetId(assetId: string): void {
    let assetCloseModalFunction: () => void

    function deleteAsset(clickEvent: Event): void {
      clickEvent.preventDefault()

      function doDelete(): void {
        cityssm.postJSON(
          Emile.urlPrefix + '/assets/doDeleteAsset',
          {
            assetId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as
              | {
                  success: true
                  assets: Asset[]
                }
              | ErrorResponse

            if (responseJSON.success) {
              Emile.assets = responseJSON.assets
              renderAssets()
              assetCloseModalFunction()
            } else {
              bulmaJS.alert({
                title: 'Error Deleting Asset',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: 'Delete Asset',
        message: 'Are you sure you want to delete this asset?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete Asset',
          callbackFunction: doDelete
        }
      })
    }

    cityssm.openHtmlModal('asset-view', {
      onshow(modalElement) {
        populateAssetModal(modalElement, assetId)

        if (Emile.canUpdate) {
          ;(
            modalElement.querySelector(
              '#form--assetView fieldset'
            ) as HTMLFieldSetElement
          ).disabled = false
          ;(
            modalElement.querySelector(
              '#assetAliasAdd--assetId'
            ) as HTMLInputElement
          ).value = assetId

          const aliasTypeSelectElement = modalElement.querySelector(
            '#assetAliasAdd--aliasTypeId'
          ) as HTMLSelectElement

          for (const aliasType of assetAliasTypes) {
            const optionElement = document.createElement('option')

            optionElement.value = aliasType.aliasTypeId.toString()
            optionElement.textContent = aliasType.aliasType

            aliasTypeSelectElement.append(optionElement)
          }
        } else {
          modalElement.querySelector('#tbody--assetAliasAdd')?.remove()
        }
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        bulmaJS.init(modalElement)

        assetCloseModalFunction = closeModalFunction

        modalElement
          .querySelector('#form--assetView')
          ?.addEventListener('submit', updateAsset)

        modalElement
          .querySelector('.is-delete-button')
          ?.addEventListener('click', deleteAsset)

        modalElement
          .querySelector('#form--assetAliasAdd')
          ?.addEventListener('submit', addAssetAlias)
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function openAssetByClick(clickEvent: MouseEvent): void {
    clickEvent.preventDefault()

    const assetId =
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .assetId ?? ''

    openAssetByAssetId(assetId)
  }

  function renderAssets(): void {
    ;(document.querySelector('#count--assets') as HTMLElement).textContent =
      Emile.assets.length.toString()

    const containerElement = document.querySelector(
      '#container--assets'
    ) as HTMLElement

    if (Emile.assets.length === 0) {
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
      <th class="has-width-10"></th>
      <th>Category</th>
      <th>Asset</th>
      <th class="has-text-centered has-width-10">
        <i class="far fa-map" aria-hidden="true"></i>
        <span class="is-sr-only">Map</span>
      </th>
      </tr></thead>
      <tbody></tbody>`

    // eslint-disable-next-line no-labels
    assetLoop: for (const asset of Emile.assets) {
      if (
        assetCategoryFilterElement.value !== '' &&
        assetCategoryFilterElement.value !== asset.categoryId?.toString()
      ) {
        continue
      }

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
      rowElement.dataset.assetId = asset.assetId?.toString() ?? ''

      rowElement.innerHTML = `<td class="has-width-10 has-text-centered">
        <i class="${
          asset.fontAwesomeIconClasses ?? 'fas fa-bolt'
        }" aria-hidden="true"></i>
        </td>
        <td data-field="category"></td>
        <td><a data-field="assetName" href="#"></a></td>
        <td class="has-width-10 has-text-centered has-text-nowrap">
          ${
            (asset.latitude ?? '') === '' || (asset.longitude ?? '') === ''
              ? ''
              : `<a class="has-tooltip-left" data-tooltip="Open Map" href="${Emile.getMapLink(
                  asset.latitude as number,
                  asset.longitude as number
                )}" target="_blank" rel="noopener noreferrer" aria-label="Open Map">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                ${asset.latitude ?? 0}, ${asset.longitude ?? 0}
                </a>`
          }
        </td>`
      ;(
        rowElement.querySelector(
          '[data-field="category"]'
        ) as HTMLTableCellElement
      ).textContent = asset.category ?? ''

      const assetNameElement = rowElement.querySelector(
        '[data-field="assetName"]'
      ) as HTMLAnchorElement

      assetNameElement.textContent = asset.assetName

      assetNameElement.addEventListener('click', openAssetByClick)
      ;(tableElement.querySelector('tbody') as HTMLTableSectionElement).append(
        rowElement
      )
    }

    if (tableElement.querySelectorAll('tbody tr').length === 0) {
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

      cityssm.postJSON(
        Emile.urlPrefix + '/assets/doAddAsset',
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as
            | {
                success: true
                assetId: number
                assets: Asset[]
              }
            | ErrorResponse

          if (responseJSON.success) {
            Emile.assets = responseJSON.assets
            renderAssets()
            addAssetCloseModalFunction()

            openAssetByAssetId(responseJSON.assetId.toString())
          }
        }
      )
    }

    cityssm.openHtmlModal('asset-add', {
      onshow(modalElement) {
        const categoryElement = modalElement.querySelector(
          '#assetAdd--categoryId'
        ) as HTMLSelectElement

        for (const category of Emile.assetCategories) {
          const optionElement = document.createElement('option')
          optionElement.value = category.categoryId?.toString() ?? ''
          optionElement.textContent = category.category
          categoryElement.append(optionElement)
        }
      },
      onshown(modalElement, closeModalFunction) {
        addAssetCloseModalFunction = closeModalFunction

        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#assetAdd--categoryId'
          ) as HTMLSelectElement
        ).focus()

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddAsset)
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  })

  /*
   * Asset Groups
   */

  const assetGroupFilterElement = document.querySelector(
    '#filter--assetGroups'
  ) as HTMLInputElement

  function populateAssetGroupModal(
    modalElement: HTMLElement,
    groupId: string
  ): void {
    cityssm.postJSON(
      Emile.urlPrefix + '/assets/doGetAssetGroup',
      {
        groupId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as
          | {
              success: true
              assetGroup: AssetGroup
            }
          | ErrorResponse

        if (!responseJSON.success) {
          bulmaJS.alert({
            title: 'Error Loading Asset Group Details',
            message: 'Please refresh the page and try again.',
            contextualColorName: 'danger'
          })
          return
        }

        ;(
          modalElement.querySelector(
            '#assetGroupView--groupId'
          ) as HTMLInputElement
        ).value = responseJSON.assetGroup.groupId?.toString() ?? ''
        ;(
          modalElement.querySelector(
            '.modal-card-head [data-field="groupName"]'
          ) as HTMLElement
        ).textContent = responseJSON.assetGroup.groupName
        ;(
          modalElement.querySelector(
            '#assetGroupView--groupName'
          ) as HTMLInputElement
        ).value = responseJSON.assetGroup.groupName
        ;(
          modalElement.querySelector(
            '#assetGroupView--isShared'
          ) as HTMLSelectElement
        ).value = responseJSON.assetGroup.isShared ? '1' : '0'
        ;(
          modalElement.querySelector(
            '#assetGroupView--groupDescription'
          ) as HTMLTextAreaElement
        ).value = responseJSON.assetGroup.groupDescription
      }
    )
  }

  function updateAssetGroup(formEvent: Event): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      Emile.urlPrefix + '/assets/doUpdateAssetGroup',
      formEvent.currentTarget,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as
          | {
              success: true
              assetGroups: AssetGroup[]
            }
          | ErrorResponse

        if (responseJSON.success) {
          Emile.assetGroups = responseJSON.assetGroups

          bulmaJS.alert({
            message: 'Asset group updated successfully.',
            contextualColorName: 'success'
          })

          renderAssets()
        } else {
          bulmaJS.alert({
            title: 'Error Updating Asset Group',
            message: responseJSON.errorMessage ?? 'Please try again.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function openGroupByGroupId(groupId: string): void {
    let assetGroupCloseModalFunction: () => void

    function deleteAssetGroup(clickEvent: Event): void {
      clickEvent.preventDefault()

      function doDelete(): void {
        cityssm.postJSON(
          Emile.urlPrefix + '/assets/doDeleteAssetGroup',
          {
            groupId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as
              | {
                  success: true
                  assetGroups: AssetGroup[]
                }
              | ErrorResponse

            if (responseJSON.success) {
              Emile.assetGroups = responseJSON.assetGroups
              renderAssetGroups()
              assetGroupCloseModalFunction()
            } else {
              bulmaJS.alert({
                title: 'Error Deleting Asset Group',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: 'Delete Asset Group',
        message: 'Are you sure you want to delete this group?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete Asset Group',
          callbackFunction: doDelete
        }
      })
    }

    cityssm.openHtmlModal('assetGroup-view', {
      onshow(modalElement) {
        populateAssetGroupModal(modalElement, groupId)

        if (Emile.canUpdate) {
          ;(
            modalElement.querySelector(
              '#form--assetGroupView fieldset'
            ) as HTMLFieldSetElement
          ).disabled = false
        }
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        bulmaJS.init(modalElement)

        if (Emile.canUpdate) {
          assetGroupCloseModalFunction = closeModalFunction

          modalElement
            .querySelector('#form--assetGroupView')
            ?.addEventListener('submit', updateAssetGroup)

          modalElement
            .querySelector('.is-delete-button')
            ?.addEventListener('click', deleteAssetGroup)
        }
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function openGroupByClick(clickEvent: MouseEvent): void {
    clickEvent.preventDefault()

    const groupId =
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .groupId ?? ''

    openGroupByGroupId(groupId)
  }

  function renderAssetGroups(): void {
    ;(
      document.querySelector('#count--assetGroups') as HTMLElement
    ).textContent = Emile.assetGroups.length.toString()

    const containerElement = document.querySelector(
      '#container--assetGroups'
    ) as HTMLElement

    if (Emile.assetGroups.length === 0) {
      containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
          <strong>No Asset Groups Found</strong><br />
          Grouping together assets can assist with reporting on multiple assets.
        </p>
        </div>`

      return
    }

    const searchPieces = assetGroupFilterElement.value
      .trim()
      .toLowerCase()
      .split(' ')

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped has-sticky-header'
    tableElement.innerHTML = `<thead><tr>
      <th>Group</th>
      <th class="has-text-centered has-width-10">
        <i class="fas fa-bolt" aria-hidden="true"></i>
        <span class="is-sr-only">Number of Assets</span>
      </th>
      </tr></thead>
      <tbody></tbody>`

    // eslint-disable-next-line no-labels
    assetGroupLoop: for (const assetGroup of Emile.assetGroups) {
      const searchText =
        assetGroup.groupName.toLowerCase() +
        ' ' +
        (assetGroup.groupDescription ?? '').toLowerCase()

      for (const searchPiece of searchPieces) {
        if (!searchText.includes(searchPiece)) {
          // eslint-disable-next-line no-labels
          continue assetGroupLoop
        }
      }

      const rowElement = document.createElement('tr')
      rowElement.dataset.groupId = assetGroup.groupId?.toString() ?? ''

      rowElement.innerHTML = `<td>
          <a data-field="groupName" href="#"></a><br />
          <span class="is-size-7" data-field="groupDescription"></span>
        </td>
        <td class="has-width-10 has-text-right">
          <span class="has-tooltip-left" data-tooltip="Group Members">${
            assetGroup.groupMemberCount ?? 0
          }</span>
        </td>`

      const groupNameElement = rowElement.querySelector(
        '[data-field="groupName"]'
      ) as HTMLAnchorElement

      groupNameElement.textContent = assetGroup.groupName

      groupNameElement.addEventListener('click', openGroupByClick)
      ;(tableElement.querySelector('tbody') as HTMLTableSectionElement).append(
        rowElement
      )
      ;(
        rowElement.querySelector(
          '[data-field="groupDescription"]'
        ) as HTMLElement
      ).textContent = assetGroup.groupDescription ?? ''
    }

    if (tableElement.querySelectorAll('tbody tr').length === 0) {
      containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
          <strong>There are no groups that meet your search criteria.</strong><br />
          Try to be less specific in your search. 
        </p>
        </div>`
    } else {
      containerElement.innerHTML = ''
      containerElement.append(tableElement)
    }
  }

  document
    .querySelector('#button--addAssetGroup')
    ?.addEventListener('click', () => {
      let addAssetGroupCloseModalFunction: () => void

      function doAddAssetGroup(formEvent: SubmitEvent): void {
        formEvent.preventDefault()

        cityssm.postJSON(
          Emile.urlPrefix + '/assets/doAddAssetGroup',
          formEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as
              | {
                  success: true
                  groupId: number
                  assetGroups: AssetGroup[]
                }
              | ErrorResponse

            if (responseJSON.success) {
              Emile.assetGroups = responseJSON.assetGroups
              renderAssetGroups()
              addAssetGroupCloseModalFunction()

              openGroupByGroupId(responseJSON.groupId.toString())
            }
          }
        )
      }

      cityssm.openHtmlModal('assetGroup-add', {
        onshown(modalElement, closeModalFunction) {
          addAssetGroupCloseModalFunction = closeModalFunction

          bulmaJS.toggleHtmlClipped()
          ;(
            modalElement.querySelector(
              '#assetGroupAdd--groupName'
            ) as HTMLInputElement
          ).focus()

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doAddAssetGroup)
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })

  /*
   * Initialize
   */

  // Initialize tabs
  bulmaJS.init()

  // Assets
  assetFilterElement.addEventListener('keyup', renderAssets)
  assetCategoryFilterElement.addEventListener('change', renderAssets)
  renderAssets()

  // Asset Groups
  assetGroupFilterElement.addEventListener('keyup', renderAssetGroups)
  renderAssetGroups()
})()
