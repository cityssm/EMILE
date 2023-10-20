"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-extra-semi */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a;
    const Emile = exports.Emile;
    const userDomain = exports.userDomain;
    const grantedIconClasses = 'fa-check has-text-success';
    const deniedIconClasses = 'fa-times has-text-danger';
    let users = exports.users;
    function updateUserPermission(changeEvent) {
        var _a, _b, _c;
        const selectElement = changeEvent.currentTarget;
        const permissionValue = selectElement.value;
        const action = (_a = selectElement.dataset.action) !== null && _a !== void 0 ? _a : '';
        const userName = (_c = (_b = selectElement.closest('tr')) === null || _b === void 0 ? void 0 : _b.dataset.userName) !== null && _c !== void 0 ? _c : '';
        cityssm.postJSON(`${Emile.urlPrefix}/admin/${action}`, {
            userName,
            permissionValue
        }, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                ;
                ((_a = selectElement
                    .closest('.field')) === null || _a === void 0 ? void 0 : _a.querySelector('.icon')).innerHTML = `<i class="fas ${permissionValue === '1' ? grantedIconClasses : deniedIconClasses}" aria-hidden="true"></i>`;
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating User Permission',
                    message: 'Please try again.',
                    contextualColorName: 'danger'
                });
                selectElement.value = selectElement.value === '1' ? '0' : '1';
            }
        });
    }
    function deleteUser(clickEvent) {
        var _a, _b;
        const userName = (_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.userName) !== null && _b !== void 0 ? _b : '';
        function doDelete() {
            cityssm.postJSON(`${Emile.urlPrefix}/admin/doDeleteUser`, {
                userName
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    users = responseJSON.users;
                    bulmaJS.alert({
                        message: 'User deleted successfully.',
                        contextualColorName: 'success'
                    });
                    renderUsers();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting User',
                        message: 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete User',
            message: `Are you sure you want to delete "${userName}"?`,
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete User',
                callbackFunction: doDelete
            }
        });
    }
    function renderUsers() {
        var _a, _b;
        const containerElement = document.querySelector('#container--users');
        if (users.length === 0) {
            containerElement.innerHTML = `<div class="message is-warning">
        <p class="message-body">
          <strong>There are no active users available.</strong>
        </p>
        </div>`;
            return;
        }
        containerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable is-fade-hoverable has-sticky-header">
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
      </table>`;
        for (const user of users) {
            const rowElement = document.createElement('tr');
            rowElement.dataset.userName = user.userName;
            rowElement.innerHTML = `<td class="is-vcentered">${user.userName}</td>
        <td>
          <div class="field has-addons">
            <div class="control">
              <span class="button is-static">
              <span class="icon">
                <i class="fas ${user.canLogin ? grantedIconClasses : deniedIconClasses}" aria-hidden="true"></i>
              </span>
              </span>
            </div>
            <div class="control is-expanded">
              <div class="select is-fullwidth">
                <select data-action="doUpdateUserCanLogin" aria-label="Can Login">
                  <option value="0">Access Denied</option>
                  <option value="1" ${user.canLogin ? ' selected' : ''}>Yes, Can Log In</option>
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
                <i class="fas ${user.canUpdate ? grantedIconClasses : deniedIconClasses}" aria-hidden="true"></i>
              </span>
              </span>
            </div>
            <div class="control is-expanded">
              <div class="select is-fullwidth">
                <select data-action="doUpdateUserCanUpdate" aria-label="Can Update Records">
                  <option value="0">Read Only</option>
                  <option value="1" ${user.canUpdate ? ' selected' : ''}>Yes, Can Update</option>
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
                <i class="fas ${user.isAdmin ? grantedIconClasses : deniedIconClasses}" aria-hidden="true"></i>
              </span>
              </span>
            </div>
            <div class="control is-expanded">
              <div class="select is-fullwidth">
                <select data-action="doUpdateUserIsAdmin" aria-label="Can Access Admin Areas">
                  <option value="0">No Admin Permissions</option>
                  <option value="1" ${user.isAdmin ? ' selected' : ''}>Administrator</option>
                </select>
              </div>
            </div>
          </div>
        </td>
        <td>
          <button class="button is-light is-danger is-delete-button" type="button" aria-label="Delete User">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </td>`;
            (_a = rowElement
                .querySelector('.is-delete-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', deleteUser);
            (_b = containerElement.querySelector('tbody')) === null || _b === void 0 ? void 0 : _b.append(rowElement);
        }
        const selectElements = containerElement.querySelectorAll('select');
        for (const selectElement of selectElements) {
            selectElement.addEventListener('change', updateUserPermission);
        }
    }
    (_a = document
        .querySelector('.is-add-user-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        let closeAddUserModalFunction;
        function doAddUser(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${Emile.urlPrefix}/admin/doAddUser`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    users = responseJSON.users;
                    closeAddUserModalFunction();
                    bulmaJS.alert({
                        message: 'User added successfully.',
                        contextualColorName: 'success'
                    });
                    renderUsers();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Adding User',
                        message: 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        cityssm.openHtmlModal('user-add', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('[data-field="userDomain"]').textContent = userDomain;
            },
            onshown(modalElement, closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeAddUserModalFunction = closeModalFunction;
                modalElement.querySelector('#userAdd--userName').focus();
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddUser);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    /*
     * Initialize
     */
    renderUsers();
    bulmaJS.init();
})();
