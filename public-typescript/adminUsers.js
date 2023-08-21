"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const Emile = exports.Emile;
    let users = exports.users;
    function renderUsers() {
        var _a;
        const containerElement = document.querySelector('#container--users');
        if (users.length === 0) {
            containerElement.innerHTML = `<div class="message is-warning">
        <p class="message-body">
          <strong>There are no active users available.</strong>
        </p>
        </div>`;
            return;
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
      </table>`;
        for (const user of users) {
            const rowElement = document.createElement('tr');
            rowElement.innerHTML = `<td>${user.userName}</td>`;
            (_a = containerElement.querySelector('tbody')) === null || _a === void 0 ? void 0 : _a.append(rowElement);
        }
    }
    /*
     * Initialize
     */
    renderUsers();
})();
