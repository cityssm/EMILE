// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { AssetCategory } from '../types/recordTypes.js'

import type { Emile as EmileGlobal } from './globalTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const Emile = exports.Emile as EmileGlobal

  function refreshIconByElement(element: HTMLElement): void {
    const iconFieldElement = element.closest('.field') as HTMLElement

    const iconClass = `${
      (
        iconFieldElement.querySelector(
          'select[name="fontAwesomeIconClass-style"]'
        ) as HTMLSelectElement
      ).value
    } fa-${
      (
        iconFieldElement.querySelector(
          'input[name="fontAwesomeIconClass-className'
        ) as HTMLInputElement
      ).value
    }`

    ;(
      iconFieldElement.querySelector('.icon') as HTMLElement
    ).innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`
  }

  function refreshIconByStyleEvent(changeEvent: Event): void {
    const selectElement = changeEvent.currentTarget as HTMLSelectElement

    ;(
      (selectElement.closest('.field') as HTMLElement).querySelector(
        'input[name="fontAwesomeIconClass-className"]'
      ) as HTMLInputElement
    ).setAttribute('list', `datalist--iconClasses-${selectElement.value}`)

    refreshIconByElement(selectElement)
  }

  function refreshIconByClassNameEvent(changeEvent: Event): void {
    refreshIconByElement(changeEvent.currentTarget as HTMLElement)
  }

  /*
   * Asset Categories
   */

  type AssetCategoriesResponseJSON =
    | {
        success: true
        assetCategories: AssetCategory[]
      }
    | {
        success: false
        errorMessage?: string
      }

  // New Category Form

  let assetCategories = exports.assetCategories as AssetCategory[]

  function updateAssetCategory(formEvent: Event): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${Emile.urlPrefix}/admin/doUpdateAssetCategory`,
      formEvent.currentTarget,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as AssetCategoriesResponseJSON

        if (responseJSON.success) {
          bulmaJS.alert({
            message: 'Category updated successfully.',
            contextualColorName: 'success'
          })

          assetCategories = responseJSON.assetCategories
          renderAssetCategories()
        } else {
          bulmaJS.alert({
            title: 'Error Updating Category',
            message: responseJSON.errorMessage ?? 'Please try again.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function moveAssetCategory(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const tableRowElement = buttonElement.closest('tr')

    const categoryId = tableRowElement?.dataset.categoryId

    cityssm.postJSON(
      `${Emile.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveAssetCategoryUp'
          : 'doMoveAssetCategoryDown'
      }`,
      {
        categoryId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as AssetCategoriesResponseJSON

        if (responseJSON.success) {
          assetCategories = responseJSON.assetCategories
          renderAssetCategories()
        } else {
          bulmaJS.alert({
            title: 'Error Moving Category',
            message: responseJSON.errorMessage ?? 'Please try again.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function deleteAssetCategory(clickEvent: Event): void {
    const categoryId = (clickEvent.currentTarget as HTMLElement).closest('tr')
      ?.dataset.categoryId

    function doDelete(): void {
      cityssm.postJSON(
        `${Emile.urlPrefix}/admin/doDeleteAssetCategory`,
        {
          categoryId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as AssetCategoriesResponseJSON

          if (responseJSON.success) {
            bulmaJS.alert({
              message: 'Category deleted successfully.',
              contextualColorName: 'success'
            })

            assetCategories = responseJSON.assetCategories
            renderAssetCategories()
          } else {
            bulmaJS.alert({
              title: 'Error Deleting Category',
              message: responseJSON.errorMessage ?? 'Please try again.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete Asset Category',
      message: 'Are you sure you want to delete this category?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Category',
        callbackFunction: doDelete
      }
    })
  }

  function renderAssetCategories(): void {
    const tbodyElement = document.querySelector(
      '#tbody--assetCategories'
    ) as HTMLTableSectionElement
    tbodyElement.innerHTML = ''

    for (const assetCategory of assetCategories) {
      const rowElement = document.createElement('tr')
      rowElement.dataset.categoryId = assetCategory.categoryId.toString()

      const fontAwesomeIconClasses =
        assetCategory.fontAwesomeIconClasses?.split(' ') ?? ['fas', 'fa-bolt']

      const formId = `form--assetCategory-${assetCategory.categoryId}`

      rowElement.innerHTML = `<td>
          <div class="field">
            <div class="control">
              <input class="input" name="category" form="${formId}" placeholder="Category Name" maxlength="100" required />
            </div>
          </div>
        </td>
        <td>
          <div class="field has-addons">
            <div class="control">
              <div class="select">
                <select name="fontAwesomeIconClass-style" form="${formId}" aria-label="Font Awesome Style" required>
                  <option value="fas">Solid</option>
                  <option value="far">Regular</option>
                </select>
              </div>
            </div>
            <div class="control is-expanded">
              <input class="input" name="fontAwesomeIconClass-className" form="${formId}" list="datalist--iconClasses-${fontAwesomeIconClasses[0]}" aria-label="Font Awesome Class Name" maxlength="43" required />
            </div>
            <div class="control">
              <span class="button is-static">
                <span class="icon"></span>
              </span>
            </div>
          </div>
        </td>
        <td class="has-width-10">
          <form id="${formId}">
            <input name="categoryId" type="hidden" value="${assetCategory.categoryId}" />
            <button class="button is-success" type="submit">
              <span class="icon"><i class="fas fa-save" aria-hidden="true"></i></span>
              <span>Update</span>
            </button>
          </form>
        </td>
        <td class="has-width-10">
          <div class="field has-addons">
            <div class="control">
              <button class="button is-move-button" data-direction="up" type="button">
                <span class="is-sr-only">Move Category Up</span>
                <span class="icon">
                <i class="fas fa-arrow-up" aria-hidden="true"></i>
                </span>
              </button>
            </div>
            <div class="control">
              <button class="button is-move-button" data-direction="down" type="button">
                <span class="is-sr-only">Move Category Down</span>
                <span class="icon">
                  <i class="fas fa-arrow-down" aria-hidden="true"></i>
                </span>
              </button>
            </div>
          </div>
        </td>
        <td class="has-width-10">
          <button class="button is-light is-danger is-delete-button" type="button">
            <span class="is-sr-only">Delete Category</span>
            <span class="icon">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </span>
          </button>
        </td>`
      ;(
        rowElement.querySelector('input[name="category"]') as HTMLInputElement
      ).value = assetCategory.category

      const styleSelectElement = rowElement.querySelector(
        'select[name="fontAwesomeIconClass-style'
      ) as HTMLSelectElement

      styleSelectElement.value = fontAwesomeIconClasses[0]
      styleSelectElement.addEventListener('change', refreshIconByStyleEvent)

      const classNameElement = rowElement.querySelector(
        'input[name="fontAwesomeIconClass-className"]'
      ) as HTMLInputElement

      classNameElement.value = fontAwesomeIconClasses[1].slice(3)
      classNameElement.addEventListener('keyup', refreshIconByClassNameEvent)

      refreshIconByElement(classNameElement)

      rowElement
        .querySelector(`#${formId}`)
        ?.addEventListener('submit', updateAssetCategory)

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const moveButtonElements = rowElement.querySelectorAll(
        '.is-move-button'
      ) as NodeListOf<HTMLButtonElement>

      for (const moveButtonElement of moveButtonElements) {
        moveButtonElement.addEventListener('click', moveAssetCategory)
      }

      rowElement
        .querySelector('.is-delete-button')
        ?.addEventListener('click', deleteAssetCategory)

      tbodyElement.append(rowElement)
    }
  }

  document
    .querySelector('#assetCategoryAdd--fontAwesomeIconClass-style')
    ?.addEventListener('change', refreshIconByStyleEvent)

  document
    .querySelector('#assetCategoryAdd--fontAwesomeIconClass-className')
    ?.addEventListener('keyup', refreshIconByClassNameEvent)

  refreshIconByElement(
    document.querySelector(
      '#assetCategoryAdd--fontAwesomeIconClass-style'
    ) as HTMLElement
  )

  document
    .querySelector('#form--assetCategoryAdd')
    ?.addEventListener('submit', (formEvent) => {
      formEvent.preventDefault()

      const formElement = formEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${Emile.urlPrefix}/admin/doAddAssetCategory`,
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as AssetCategoriesResponseJSON

          if (responseJSON.success) {
            assetCategories = responseJSON.assetCategories ?? []
            renderAssetCategories()

            formElement.reset()
          }
        }
      )
    })

  renderAssetCategories()
})()
