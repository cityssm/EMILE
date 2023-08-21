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

  let users = exports.users as EmileUser[]

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
          <th>Can Login</th>
          <th>Can Update</th>
          <th>Is Admin</th>
          <th>Options</th>
        </tr>
      </thead>
      <tbody></tbody>
      </table>`

    for (const user of users) {
      const rowElement = document.createElement('tr')

      rowElement.innerHTML = `<td>${user.userName}</td>`

      containerElement.querySelector('tbody')?.append(rowElement)
    }
  }

  /*
   * Initialize
   */

  renderUsers()
})()
