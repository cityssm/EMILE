// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Emile as EmileGlobal } from './globalTypes.js'
import type * as recordTypes from '../types/recordTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const Emile = exports.Emile as EmileGlobal

  function refreshIconByElement(element: HTMLElement): void {
    const iconFieldElement = element.closest('.field') as HTMLElement

    const iconClass =
      (
        iconFieldElement.querySelector(
          'select[name="fontAwesomeIconClass-style"]'
        ) as HTMLSelectElement
      ).value +
      ' fa-' +
      (
        iconFieldElement.querySelector(
          'input[name="fontAwesomeIconClass-className'
        ) as HTMLInputElement
      ).value

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

  // New Category Form

  let assetCategories = exports.assetCategories as recordTypes.AssetCategory[]

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
                <select name="fontAwesomeIconClass-style" form="${formId}" required>
                  <option value="fas">Solid</option>
                  <option value="far">Regular</option>
                </select>
              </div>
            </div>
            <div class="control is-expanded">
              <input class="input" name="fontAwesomeIconClass-className" form="${formId}" list="datalist--iconClasses-${fontAwesomeIconClasses[0]}" maxlength="43" required />
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
              <button class="button is-move-up-button" type="button">
                <span class="icon">
                  <i class="fas fa-arrow-up" aria-hidden="true"></i>
                </span>
              </button>
            </div>
            <div class="control">
              <button class="button is-move-down-button" type="button">
                <span class="icon">
                  <i class="fas fa-arrow-down" aria-hidden="true"></i>
                </span>
              </button>
            </div>
          </div>
        </td>
        <td class="has-width-10">
          <button class="button is-light is-danger is-delete-button" type="button">
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

      cityssm.postJSON(
        Emile.urlPrefix + '/admin/doAddAssetCategory',
        formEvent.currentTarget,
        (rawResponseJSON) => {}
      )
    })

  renderAssetCategories()
})()
