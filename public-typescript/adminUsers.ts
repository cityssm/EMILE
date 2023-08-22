// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Emile as EmileGlobal } from './globalTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const Emile = exports.Emile as EmileGlobal

  const userDomain = exports.userDomain as string

  const grantedIconClasses = 'fa-check has-text-success'
  const deniedIconClasses = 'fa-times has-text-danger'

  let users = exports.users as EmileUser[]

  function updateUserPermission(changeEvent: Event): void {
    const selectElement = changeEvent.currentTarget as HTMLSelectElement
    const permissionValue = selectElement.value

    const action = selectElement.dataset.action ?? ''
    const userName = selectElement.closest('tr')?.dataset.userName ?? ''

    cityssm.postJSON(
      `${Emile.urlPrefix}/admin/${action}`,
      {
        userName,
        permissionValue
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { success: boolean }

        if (responseJSON.success) {
          ;(
            selectElement
              .closest('.field')
              ?.querySelector('.icon') as HTMLElement
          ).innerHTML = `<i class="fas ${
            permissionValue === '1' ? grantedIconClasses : deniedIconClasses
          }" aria-hidden="true"></i>`
        } else {
          bulmaJS.alert({
            title: 'Error Updating User Permission',
            message: 'Please try again.',
            contextualColorName: 'danger'
          })

          selectElement.value = selectElement.value === '1' ? '0' : '1'
        }
      }
    )
  }

  function deleteUser(clickEvent: Event): void {
    const userName =
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .userName ?? ''

    function doDelete(): void {
      cityssm.postJSON(
        `${Emile.urlPrefix}/admin/doDeleteUser`,
        {
          userName
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            users: EmileUser[]
          }

          if (responseJSON.success) {
            users = responseJSON.users

            bulmaJS.alert({
              message: 'User deleted successfully.',
              contextualColorName: 'success'
            })

            renderUsers()
          } else {
            bulmaJS.alert({
              title: 'Error Deleting User',
              message: 'Please try again.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete "${userName}"?`,
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete User',
        callbackFunction: doDelete
      }
    })
  }

  function renderUsers(): void {
    const containerElement = document.querySelector(
      '#container--users'
    ) as HTMLElement

    if (users.length === 0) {
      containerElement.innerHTML = `<div class="message is-warning">
        <p class="message-body">
          <strong>There are no active users available.</strong>
        </p>
        </div>`
      return
    }

    containerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead>
        <tr>
          <th>User Name</th>
          <th class="has-text-centered">Can Login</th>
          <th class="has-text-centered">Can Update</th>
          <th class="has-text-centered">Is Admin</th>
          <th class="has-width-10">
            <span class="is-sr-only">Options</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
      </table>`

    for (const user of users) {
      const rowElement = document.createElement('tr')
      rowElement.dataset.userName = user.userName

      rowElement.innerHTML = `<td class="is-vcentered">${user.userName}</td>
        <td>
          <div class="field has-addons">
            <div class="control">
              <span class="button is-static">
              <span class="icon">
                <i class="fas ${
                  user.canLogin ? grantedIconClasses : deniedIconClasses
                }" aria-hidden="true"></i>
              </span>
              </span>
            </div>
            <div class="control is-expanded">
              <div class="select is-fullwidth">
                <select data-action="doUpdateUserCanLogin">
                  <option value="0">Access Denied</option>
                  <option value="1" ${
                    user.canLogin ? ' selected' : ''
                  }>Yes, Can Log In</option>
                </select>
              </div>
            </div>
          </div>
        </td>
        <td>
          <div class="field has-addons">
            <div class="control">
              <span class="button is-static">
              <span class="icon">
                <i class="fas ${
                  user.canUpdate ? grantedIconClasses : deniedIconClasses
                }" aria-hidden="true"></i>
              </span>
              </span>
            </div>
            <div class="control is-expanded">
              <div class="select is-fullwidth">
                <select data-action="doUpdateUserCanUpdate">
                  <option value="0">Read Only</option>
                  <option value="1" ${
                    user.canUpdate ? ' selected' : ''
                  }>Yes, Can Update</option>
                </select>
              </div>
            </div>
          </div>
        </td>
        <td>
          <div class="field has-addons">
            <div class="control">
              <span class="button is-static">
              <span class="icon">
                <i class="fas ${
                  user.isAdmin ? grantedIconClasses : deniedIconClasses
                }" aria-hidden="true"></i>
              </span>
              </span>
            </div>
            <div class="control is-expanded">
              <div class="select is-fullwidth">
                <select data-action="doUpdateUserIsAdmin">
                  <option value="0">No Admin Permissions</option>
                  <option value="1" ${
                    user.isAdmin ? ' selected' : ''
                  }>Administrator</option>
                </select>
              </div>
            </div>
          </div>
        </td>
        <td>
          <button class="button is-light is-danger is-delete-button" type="button" aria-label="Delete User">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </td>`

      rowElement
        .querySelector('.is-delete-button')
        ?.addEventListener('click', deleteUser)

      containerElement.querySelector('tbody')?.append(rowElement)
    }

    const selectElements = containerElement.querySelectorAll('select')

    for (const selectElement of selectElements) {
      selectElement.addEventListener('change', updateUserPermission)
    }
  }

  document
    .querySelector('.is-add-user-button')
    ?.addEventListener('click', () => {
      let closeAddUserModalFunction: () => void

      function doAddUser(formEvent: Event): void {
        formEvent.preventDefault()

        cityssm.postJSON(
          `${Emile.urlPrefix}/admin/doAddUser`,
          formEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              users: EmileUser[]
            }

            if (responseJSON.success) {
              users = responseJSON.users

              closeAddUserModalFunction()

              bulmaJS.alert({
                message: 'User added successfully.',
                contextualColorName: 'success'
              })

              renderUsers()
            } else {
              bulmaJS.alert({
                title: 'Error Adding User',
                message: 'Please try again.',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('user-add', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector(
              '[data-field="userDomain"]'
            ) as HTMLElement
          ).textContent = userDomain
        },
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()

          closeAddUserModalFunction = closeModalFunction

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doAddUser)
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })

  /*
   * Initialize
   */

  renderUsers()
})()
