"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */
Object.defineProperty(exports, "__esModule", { value: true });
;
(() => {
    var _a;
    const Emile = exports.Emile;
    const assetGroupFilterElement = document.querySelector('#filter--assetGroups');
    function deleteGroupMember(clickEvent) {
        var _a, _b;
        const rowElement = clickEvent.currentTarget.closest('tr');
        const groupId = (_a = rowElement.dataset.groupId) !== null && _a !== void 0 ? _a : '';
        const assetId = (_b = rowElement.dataset.assetId) !== null && _b !== void 0 ? _b : '';
        function doDelete() {
            cityssm.postJSON(`${Emile.urlPrefix}/assets/doDeleteAssetGroupMember`, {
                groupId,
                assetId
            }, (rawResponseJSON) => {
                var _a;
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    renderAssetGroupMembers(groupId, responseJSON.groupMembers);
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Group Member',
                        message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Group Member',
            message: 'Are you sure you want to remove this asset from this group?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Remove Member from Group',
                callbackFunction: doDelete
            }
        });
    }
    function renderAssetGroupMembers(groupId, groupMembers) {
        var _a, _b, _c, _d, _e, _f;
        const tbodyElement = document.querySelector('.modal #tbody--groupMembers');
        tbodyElement.innerHTML = '';
        for (const groupMember of groupMembers) {
            const rowElement = document.createElement('tr');
            rowElement.dataset.groupId = groupId;
            rowElement.dataset.assetId = groupMember.assetId.toString();
            rowElement.innerHTML = `<td data-field="category"></td>
        <td data-field="assetName"></td>
        <td>
          ${Emile.canUpdate
                ? `<button class="button is-danger is-delete-button" type="button">
                  <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
                  <span>Delete Member</span>
                  </button>`
                : ''}
        </td>`;
            rowElement.querySelector('[data-field="category"]').textContent = (_a = groupMember.category) !== null && _a !== void 0 ? _a : '';
            rowElement.querySelector('[data-field="assetName"]').textContent = (_b = groupMember.assetName) !== null && _b !== void 0 ? _b : '';
            (_c = rowElement
                .querySelector('.is-delete-button')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', deleteGroupMember);
            tbodyElement.append(rowElement);
        }
        if (Emile.canUpdate) {
            const groupMemberSelectElement = document.querySelector('.modal #groupMemberAdd--assetId');
            groupMemberSelectElement.innerHTML =
                '<option value="">(Select an Asset)</option>';
            for (const asset of Emile.assets) {
                const assetInGroup = groupMembers.some((possibleAsset) => {
                    return possibleAsset.assetId === asset.assetId;
                });
                if (assetInGroup) {
                    continue;
                }
                const optionElement = document.createElement('option');
                optionElement.value = asset.assetId.toString();
                optionElement.textContent = asset.assetName;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                let optgroupElement = groupMemberSelectElement.querySelector(`optgroup[data-category-id="${(_d = asset.categoryId) !== null && _d !== void 0 ? _d : ''}"]`);
                if (optgroupElement === null) {
                    optgroupElement = document.createElement('optgroup');
                    optgroupElement.dataset.categoryId = (_e = asset.categoryId) === null || _e === void 0 ? void 0 : _e.toString();
                    optgroupElement.label = (_f = asset.category) !== null && _f !== void 0 ? _f : '';
                    groupMemberSelectElement.append(optgroupElement);
                }
                optgroupElement.append(optionElement);
            }
        }
    }
    function populateAssetGroupModal(modalElement, groupId) {
        cityssm.postJSON(`${Emile.urlPrefix}/assets/doGetAssetGroup`, {
            groupId
        }, (rawResponseJSON) => {
            var _a, _b, _c;
            const responseJSON = rawResponseJSON;
            if (!responseJSON.success) {
                bulmaJS.alert({
                    title: 'Error Loading Asset Group Details',
                    message: 'Please refresh the page and try again.',
                    contextualColorName: 'danger'
                });
                return;
            }
            ;
            modalElement.querySelector('#assetGroupView--groupId').value = (_b = (_a = responseJSON.assetGroup.groupId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
            modalElement.querySelector('.modal-card-head [data-field="groupName"]').textContent = responseJSON.assetGroup.groupName;
            modalElement.querySelector('#assetGroupView--groupName').value = responseJSON.assetGroup.groupName;
            modalElement.querySelector('#assetGroupView--isShared').value = responseJSON.assetGroup.isShared ? '1' : '0';
            modalElement.querySelector('#assetGroupView--groupDescription').value = responseJSON.assetGroup.groupDescription;
            renderAssetGroupMembers(groupId, (_c = responseJSON.assetGroup.groupMembers) !== null && _c !== void 0 ? _c : []);
        });
    }
    function updateAssetGroup(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${Emile.urlPrefix}/assets/doUpdateAssetGroup`, formEvent.currentTarget, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                Emile.assetGroups = responseJSON.assetGroups;
                bulmaJS.alert({
                    message: 'Asset group updated successfully.',
                    contextualColorName: 'success'
                });
                renderAssetGroups();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Asset Group',
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function addAssetGroupMember(formEvent) {
        formEvent.preventDefault();
        const formElement = formEvent.currentTarget;
        cityssm.postJSON(`${Emile.urlPrefix}/assets/doAddAssetGroupMember`, formElement, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                renderAssetGroupMembers(formElement.querySelector('[name="groupId"]')
                    .value, responseJSON.groupMembers);
                formElement.reset();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Adding Group Member',
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function openGroupByGroupId(groupId) {
        let assetGroupCloseModalFunction;
        function deleteAssetGroup(clickEvent) {
            clickEvent.preventDefault();
            function doDelete() {
                cityssm.postJSON(Emile.urlPrefix + '/assets/doDeleteAssetGroup', {
                    groupId
                }, (rawResponseJSON) => {
                    var _a;
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        Emile.assetGroups = responseJSON.assetGroups;
                        renderAssetGroups();
                        assetGroupCloseModalFunction();
                    }
                    else {
                        bulmaJS.alert({
                            title: 'Error Deleting Asset Group',
                            message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : '',
                            contextualColorName: 'danger'
                        });
                    }
                });
            }
            bulmaJS.confirm({
                title: 'Delete Asset Group',
                message: 'Are you sure you want to delete this group?',
                contextualColorName: 'warning',
                okButton: {
                    text: 'Yes, Delete Asset Group',
                    callbackFunction: doDelete
                }
            });
        }
        cityssm.openHtmlModal('assetGroup-view', {
            onshow(modalElement) {
                var _a;
                populateAssetGroupModal(modalElement, groupId);
                if (Emile.canUpdate) {
                    ;
                    modalElement.querySelector('#form--assetGroupView fieldset').disabled = false;
                    modalElement.querySelector('#groupMemberAdd--groupId').value = groupId;
                }
                else {
                    (_a = modalElement.querySelector('#tbody--groupMemberAdd')) === null || _a === void 0 ? void 0 : _a.remove();
                }
            },
            onshown(modalElement, closeModalFunction) {
                var _a, _b, _c;
                bulmaJS.toggleHtmlClipped();
                bulmaJS.init(modalElement);
                if (Emile.canUpdate) {
                    assetGroupCloseModalFunction = closeModalFunction;
                    (_a = modalElement
                        .querySelector('#form--assetGroupView')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', updateAssetGroup);
                    (_b = modalElement
                        .querySelector('.is-delete-button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', deleteAssetGroup);
                    (_c = modalElement
                        .querySelector('#form--groupMemberAdd')) === null || _c === void 0 ? void 0 : _c.addEventListener('submit', addAssetGroupMember);
                }
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openGroupByClick(clickEvent) {
        var _a, _b;
        clickEvent.preventDefault();
        const groupId = (_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.groupId) !== null && _b !== void 0 ? _b : '';
        openGroupByGroupId(groupId);
    }
    function renderAssetGroups() {
        var _a, _b, _c;
        ;
        document.querySelector('#count--assetGroups').textContent = Emile.assetGroups.length.toString();
        const containerElement = document.querySelector('#container--assetGroups');
        if (Emile.assetGroups.length === 0) {
            containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
          <strong>No Asset Groups Found</strong><br />
          Grouping together assets can assist with reporting on multiple assets.
        </p>
        </div>`;
            return;
        }
        const searchPieces = assetGroupFilterElement.value
            .trim()
            .toLowerCase()
            .split(' ');
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped has-sticky-header';
        tableElement.innerHTML = `<thead><tr>
      <th>Group</th>
      <th class="has-text-right">Members</th>
      <th class="has-text-right">Shared</th>
      </tr></thead>
      <tbody></tbody>`;
        // eslint-disable-next-line no-labels
        assetGroupLoop: for (const assetGroup of Emile.assetGroups) {
            const searchText = assetGroup.groupName.toLowerCase() +
                ' ' +
                ((_a = assetGroup.groupDescription) !== null && _a !== void 0 ? _a : '').toLowerCase();
            for (const searchPiece of searchPieces) {
                if (!searchText.includes(searchPiece)) {
                    // eslint-disable-next-line no-labels
                    continue assetGroupLoop;
                }
            }
            const rowElement = document.createElement('tr');
            rowElement.dataset.groupId = assetGroup.groupId.toString();
            rowElement.innerHTML = `<td>
          <a class="has-text-weight-bold" data-field="groupName" href="#"></a><br />
          <span class="is-size-7" data-field="groupDescription"></span>
        </td>
        <td class="has-text-right">
          ${(_b = assetGroup.groupMemberCount) !== null && _b !== void 0 ? _b : 0}
        </td>
        <td class="has-text-right">
          ${assetGroup.isShared ? 'Shared Group' : 'Private'}
        </td>`;
            const groupNameElement = rowElement.querySelector('[data-field="groupName"]');
            groupNameElement.textContent = assetGroup.groupName;
            groupNameElement.addEventListener('click', openGroupByClick);
            tableElement.querySelector('tbody').append(rowElement);
            rowElement.querySelector('[data-field="groupDescription"]').textContent = (_c = assetGroup.groupDescription) !== null && _c !== void 0 ? _c : '';
        }
        if (tableElement.querySelectorAll('tbody tr').length === 0) {
            containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
          <strong>There are no groups that meet your search criteria.</strong><br />
          Try to be less specific in your search. 
        </p>
        </div>`;
        }
        else {
            containerElement.innerHTML = '';
            containerElement.append(tableElement);
        }
    }
    (_a = document
        .querySelector('#button--addAssetGroup')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        let addAssetGroupCloseModalFunction;
        function doAddAssetGroup(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(Emile.urlPrefix + '/assets/doAddAssetGroup', formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    Emile.assetGroups = responseJSON.assetGroups;
                    renderAssetGroups();
                    addAssetGroupCloseModalFunction();
                    openGroupByGroupId(responseJSON.groupId.toString());
                }
            });
        }
        cityssm.openHtmlModal('assetGroup-add', {
            onshown(modalElement, closeModalFunction) {
                var _a;
                addAssetGroupCloseModalFunction = closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#assetGroupAdd--groupName').focus();
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddAssetGroup);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    /*
     * Initialize
     */
    // Asset Groups
    assetGroupFilterElement.addEventListener('keyup', renderAssetGroups);
    renderAssetGroups();
})();
