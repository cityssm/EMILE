// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Asset, AssetGroup } from '../types/recordTypes.js'

import type { Emile as EmileGlobal } from './globalTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal

interface ErrorResponse {
  success: false
  errorMessage?: string
}

;(() => {
  const Emile = exports.Emile as EmileGlobal

  /*
   * Asset Groups
   */

  type GroupMembersResponseJSON =
    | {
        success: true
        groupMembers: Asset[]
      }
    | {
        success: false
        errorMessage?: string
      }

  const assetGroupFilterElement = document.querySelector(
    '#filter--assetGroups'
  ) as HTMLInputElement

  function deleteGroupMember(clickEvent: Event): void {
    const rowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const groupId = rowElement.dataset.groupId ?? ''
    const assetId = rowElement.dataset.assetId ?? ''

    function doDelete(): void {
      cityssm.postJSON(
        `${Emile.urlPrefix}/assets/doDeleteAssetGroupMember`,
        {
          groupId,
          assetId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as GroupMembersResponseJSON

          if (responseJSON.success) {
            renderAssetGroupMembers(groupId, responseJSON.groupMembers)
          } else {
            bulmaJS.alert({
              title: 'Error Deleting Group Member',
              message: responseJSON.errorMessage ?? 'Please try again.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete Group Member',
      message: 'Are you sure you want to remove this asset from this group?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Remove Member from Group',
        callbackFunction: doDelete
      }
    })
  }

  function renderAssetGroupMembers(
    groupId: string,
    groupMembers: Asset[]
  ): void {
    const tbodyElement = document.querySelector(
      '.modal #tbody--groupMembers'
    ) as HTMLTableSectionElement

    tbodyElement.innerHTML = ''

    for (const groupMember of groupMembers) {
      const rowElement = document.createElement('tr')
      rowElement.dataset.groupId = groupId
      rowElement.dataset.assetId = groupMember.assetId.toString()

      rowElement.innerHTML = `<td data-field="category"></td>
        <td data-field="assetName"></td>
        <td>
          ${
            Emile.canUpdate
              ? `<button class="button is-danger is-delete-button" type="button">
                  <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
                  <span>Delete Member</span>
                  </button>`
              : ''
          }
        </td>`
      ;(
        rowElement.querySelector('[data-field="category"]') as HTMLElement
      ).textContent = groupMember.category ?? ''
      ;(
        rowElement.querySelector('[data-field="assetName"]') as HTMLElement
      ).textContent = groupMember.assetName ?? ''

      rowElement
        .querySelector('.is-delete-button')
        ?.addEventListener('click', deleteGroupMember)

      tbodyElement.append(rowElement)
    }

    if (Emile.canUpdate) {
      const groupMemberSelectElement = document.querySelector(
        '.modal #groupMemberAdd--assetId'
      ) as HTMLSelectElement

      groupMemberSelectElement.innerHTML =
        '<option value="">(Select an Asset)</option>'

      for (const asset of Emile.assets) {
        const assetInGroup = groupMembers.some((possibleAsset) => {
          return possibleAsset.assetId === asset.assetId
        })

        if (assetInGroup) {
          continue
        }

        const optionElement = document.createElement('option')
        optionElement.value = asset.assetId.toString()
        optionElement.textContent = asset.assetName

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        let optgroupElement = groupMemberSelectElement.querySelector(
          `optgroup[data-category-id="${asset.categoryId ?? ''}"]`
        ) as HTMLOptGroupElement | null

        if (optgroupElement === null) {
          optgroupElement = document.createElement('optgroup')
          optgroupElement.dataset.categoryId = asset.categoryId?.toString()
          optgroupElement.label = asset.category ?? ''
          groupMemberSelectElement.append(optgroupElement)
        }

        optgroupElement.append(optionElement)
      }
    }
  }

  function populateAssetGroupModal(
    modalElement: HTMLElement,
    groupId: string
  ): void {
    cityssm.postJSON(
      `${Emile.urlPrefix}/assets/doGetAssetGroup`,
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

        renderAssetGroupMembers(
          groupId,
          responseJSON.assetGroup.groupMembers ?? []
        )
      }
    )
  }

  function updateAssetGroup(formEvent: Event): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${Emile.urlPrefix}/assets/doUpdateAssetGroup`,
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

          renderAssetGroups()
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

  function addAssetGroupMember(formEvent: Event): void {
    formEvent.preventDefault()

    const formElement = formEvent.currentTarget as HTMLFormElement

    cityssm.postJSON(
      `${Emile.urlPrefix}/assets/doAddAssetGroupMember`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as GroupMembersResponseJSON

        if (responseJSON.success) {
          renderAssetGroupMembers(
            (formElement.querySelector('[name="groupId"]') as HTMLInputElement)
              .value,
            responseJSON.groupMembers
          )
          formElement.reset()
        } else {
          bulmaJS.alert({
            title: 'Error Adding Group Member',
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
          ;(
            modalElement.querySelector(
              '#groupMemberAdd--groupId'
            ) as HTMLInputElement
          ).value = groupId
        } else {
          modalElement.querySelector('#tbody--groupMemberAdd')?.remove()
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

          modalElement
            .querySelector('#form--groupMemberAdd')
            ?.addEventListener('submit', addAssetGroupMember)
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
      <th class="has-text-right">Members</th>
      <th class="has-text-right">Shared</th>
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
      rowElement.dataset.groupId = assetGroup.groupId.toString()

      rowElement.innerHTML = `<td>
          <a class="has-text-weight-bold" data-field="groupName" href="#"></a><br />
          <span class="is-size-7" data-field="groupDescription"></span>
        </td>
        <td class="has-text-right">
          ${assetGroup.groupMemberCount ?? 0}
        </td>
        <td class="has-text-right">
          ${assetGroup.isShared ? 'Shared Group' : 'Private'}
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

  // Asset Groups
  assetGroupFilterElement.addEventListener('keyup', renderAssetGroups)
  renderAssetGroups()
})()
