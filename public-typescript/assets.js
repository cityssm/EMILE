"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-extra-semi */
Object.defineProperty(exports, "__esModule", { value: true });
;
(() => {
    var _a;
    const Emile = exports.Emile;
    const assetAliasTypes = exports.assetAliasTypes;
    const assetCategoryFilterElement = document.querySelector('#filter--categoryId');
    const assetFilterElement = document.querySelector('#filter--assets');
    function deleteAssetAlias(clickEvent) {
        const rowElement = clickEvent.currentTarget.closest('tr');
        const aliasId = rowElement.dataset.aliasId;
        const assetId = rowElement.dataset.assetId;
        function doDelete() {
            cityssm.postJSON(`${Emile.urlPrefix}/assets/doDeleteAssetAlias`, {
                aliasId,
                assetId
            }, (rawResponseJSON) => {
                var _a;
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    renderAssetAliases(responseJSON.assetAliases);
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Alias',
                        message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Asset Alias',
            message: 'Are you sure you want to remove this asset alias?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Remove Alias',
                callbackFunction: doDelete
            }
        });
    }
    function renderAssetAliases(assetAliases) {
        var _a, _b, _c;
        const tbodyElement = document.querySelector('.modal #tbody--assetAliases');
        tbodyElement.innerHTML = '';
        for (const assetAlias of assetAliases) {
            const rowElement = document.createElement('tr');
            rowElement.dataset.aliasId = assetAlias.aliasId.toString();
            rowElement.dataset.assetId = assetAlias.assetId.toString();
            rowElement.innerHTML = `<td data-field="aliasType"></td>
        <td data-field="assetAlias"></td>
        <td>
          ${Emile.canUpdate
                ? `<button class="button is-danger is-delete-button" type="button">
                  <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
                  <span>Delete Alias</span>
                  </button>`
                : ''}
        </td>`;
            rowElement.querySelector('[data-field="aliasType"]').textContent = (_a = assetAlias.aliasType) !== null && _a !== void 0 ? _a : '';
            rowElement.querySelector('[data-field="assetAlias"]').textContent = (_b = assetAlias.assetAlias) !== null && _b !== void 0 ? _b : '';
            (_c = rowElement
                .querySelector('.is-delete-button')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', deleteAssetAlias);
            tbodyElement.append(rowElement);
        }
    }
    function populateAssetModal(modalElement, assetId) {
        cityssm.postJSON(`${Emile.urlPrefix}/assets/doGetAsset`, {
            assetId
        }, (rawResponseJSON) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            const responseJSON = rawResponseJSON;
            if (!responseJSON.success) {
                bulmaJS.alert({
                    title: 'Error Loading Asset Details',
                    message: 'Please refresh the page and try again.',
                    contextualColorName: 'danger'
                });
                return;
            }
            /*
             * Asset Details Tab
             */
            ;
            modalElement.querySelector('#assetView--assetId').value = (_b = (_a = responseJSON.asset.assetId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
            modalElement.querySelector('.modal-card-head [data-field="assetName"]').textContent = responseJSON.asset.assetName;
            const categoryElement = modalElement.querySelector('#assetView--categoryId');
            let categoryFound = false;
            if (Emile.canUpdate) {
                for (const category of Emile.assetCategories) {
                    const optionElement = document.createElement('option');
                    optionElement.value = (_d = (_c = category.categoryId) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
                    optionElement.textContent = category.category;
                    if (category.categoryId === responseJSON.asset.categoryId) {
                        optionElement.selected = true;
                        categoryFound = true;
                    }
                    categoryElement.append(optionElement);
                }
            }
            if (!categoryFound) {
                const optionElement = document.createElement('option');
                optionElement.value = (_f = (_e = responseJSON.asset.categoryId) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : '';
                optionElement.textContent = (_g = responseJSON.asset.category) !== null && _g !== void 0 ? _g : '';
                optionElement.selected = true;
                categoryElement.append(optionElement);
            }
            ;
            modalElement.querySelector('#assetView--assetName').value = responseJSON.asset.assetName;
            modalElement.querySelector('#assetView--latitude').value = (_j = (_h = responseJSON.asset.latitude) === null || _h === void 0 ? void 0 : _h.toFixed(6)) !== null && _j !== void 0 ? _j : '';
            modalElement.querySelector('#assetView--longitude').value = (_l = (_k = responseJSON.asset.longitude) === null || _k === void 0 ? void 0 : _k.toFixed(6)) !== null && _l !== void 0 ? _l : '';
            /*
             * Asset Aliases Tabs
             */
            renderAssetAliases((_m = responseJSON.asset.assetAliases) !== null && _m !== void 0 ? _m : []);
        });
    }
    function updateAsset(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${Emile.urlPrefix}/assets/doUpdateAsset`, formEvent.currentTarget, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                Emile.assets = responseJSON.assets;
                bulmaJS.alert({
                    message: 'Asset updated successfully.',
                    contextualColorName: 'success'
                });
                renderAssets();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Asset',
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function addAssetAlias(formEvent) {
        formEvent.preventDefault();
        const formElement = formEvent.currentTarget;
        cityssm.postJSON(`${Emile.urlPrefix}/assets/doAddAssetAlias`, formElement, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                renderAssetAliases(responseJSON.assetAliases);
                formElement.reset();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Adding Alias',
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function openAssetByAssetId(assetId) {
        let assetCloseModalFunction;
        function deleteAsset(clickEvent) {
            clickEvent.preventDefault();
            function doDelete() {
                cityssm.postJSON(`${Emile.urlPrefix}/assets/doDeleteAsset`, {
                    assetId
                }, (rawResponseJSON) => {
                    var _a;
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        Emile.assets = responseJSON.assets;
                        renderAssets();
                        assetCloseModalFunction();
                    }
                    else {
                        bulmaJS.alert({
                            title: 'Error Deleting Asset',
                            message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : '',
                            contextualColorName: 'danger'
                        });
                    }
                });
            }
            bulmaJS.confirm({
                title: 'Delete Asset',
                message: 'Are you sure you want to delete this asset?',
                contextualColorName: 'warning',
                okButton: {
                    text: 'Yes, Delete Asset',
                    callbackFunction: doDelete
                }
            });
        }
        cityssm.openHtmlModal('asset-view', {
            onshow(modalElement) {
                var _a;
                populateAssetModal(modalElement, assetId);
                if (Emile.canUpdate) {
                    ;
                    modalElement.querySelector('#form--assetView fieldset').disabled = false;
                    modalElement.querySelector('#assetAliasAdd--assetId').value = assetId;
                    const aliasTypeSelectElement = modalElement.querySelector('#assetAliasAdd--aliasTypeId');
                    for (const aliasType of assetAliasTypes) {
                        const optionElement = document.createElement('option');
                        optionElement.value = aliasType.aliasTypeId.toString();
                        optionElement.textContent = aliasType.aliasType;
                        aliasTypeSelectElement.append(optionElement);
                    }
                }
                else {
                    (_a = modalElement.querySelector('#tbody--assetAliasAdd')) === null || _a === void 0 ? void 0 : _a.remove();
                }
            },
            onshown(modalElement, closeModalFunction) {
                var _a, _b, _c;
                bulmaJS.toggleHtmlClipped();
                bulmaJS.init(modalElement);
                assetCloseModalFunction = closeModalFunction;
                (_a = modalElement
                    .querySelector('#form--assetView')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', updateAsset);
                (_b = modalElement
                    .querySelector('.is-delete-button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', deleteAsset);
                (_c = modalElement
                    .querySelector('#form--assetAliasAdd')) === null || _c === void 0 ? void 0 : _c.addEventListener('submit', addAssetAlias);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openAssetByClick(clickEvent) {
        var _a, _b;
        clickEvent.preventDefault();
        const assetId = (_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.assetId) !== null && _b !== void 0 ? _b : '';
        openAssetByAssetId(assetId);
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const mergeAssetsButtonElement = document.querySelector('#button--mergeAssets');
    const assetsContainerElement = document.querySelector('#container--assets');
    function toggleMergeAssetsButton() {
        if (mergeAssetsButtonElement !== null) {
            mergeAssetsButtonElement.disabled =
                assetsContainerElement.querySelectorAll('input.selectedAssetId:checked')
                    .length < 2;
        }
    }
    mergeAssetsButtonElement === null || mergeAssetsButtonElement === void 0 ? void 0 : mergeAssetsButtonElement.addEventListener('click', () => {
        var _a, _b;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const selectedAssetIdElements = assetsContainerElement.querySelectorAll('input.selectedAssetId:checked');
        const selectedAssetIds = [];
        for (const selectedAssetIdElement of selectedAssetIdElements) {
            selectedAssetIds.push(selectedAssetIdElement.value);
        }
        const selectedAssets = [];
        for (const asset of Emile.assets) {
            if (selectedAssetIds.includes((_b = (_a = asset.assetId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '')) {
                selectedAssets.push(asset);
            }
        }
        let mergeCloseModalFunction;
        function doMergeAssets(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${Emile.urlPrefix}/assets/doMergeAssets`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    mergeCloseModalFunction();
                    Emile.assets = responseJSON.assets;
                    renderAssets();
                    openAssetByAssetId(responseJSON.assetId.toString());
                }
            });
        }
        cityssm.openHtmlModal('asset-merge', {
            onshow(modalElement) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                ;
                modalElement.querySelector('#assetMerge--assetIds').value = selectedAssetIds.join(',');
                const categoryElement = modalElement.querySelector('#assetMerge--categoryId');
                const assetNameElement = modalElement.querySelector('#assetMerge--assetName');
                const latitudeLongitudeElement = modalElement.querySelector('#assetMerge--latitudeLongitude');
                for (const selectedAsset of selectedAssets) {
                    const categoryOptionElement = document.createElement('option');
                    categoryOptionElement.textContent = (_a = selectedAsset.category) !== null && _a !== void 0 ? _a : '';
                    categoryOptionElement.value =
                        (_c = (_b = selectedAsset.categoryId) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : '';
                    categoryElement.append(categoryOptionElement);
                    const assetNameOptionElement = document.createElement('option');
                    assetNameOptionElement.textContent = selectedAsset.assetName;
                    assetNameOptionElement.value = selectedAsset.assetName;
                    assetNameElement.append(assetNameOptionElement);
                    if (((_d = selectedAsset.latitude) !== null && _d !== void 0 ? _d : undefined) !== undefined ||
                        ((_e = selectedAsset.longitude) !== null && _e !== void 0 ? _e : undefined) !== undefined) {
                        const latitudeLongitudeOptionElement = document.createElement('option');
                        latitudeLongitudeOptionElement.textContent = `${(_g = (_f = selectedAsset.latitude) === null || _f === void 0 ? void 0 : _f.toString()) !== null && _g !== void 0 ? _g : ''}, ${(_j = (_h = selectedAsset.longitude) === null || _h === void 0 ? void 0 : _h.toString()) !== null && _j !== void 0 ? _j : ''}`;
                        latitudeLongitudeOptionElement.value = `${(_l = (_k = selectedAsset.latitude) === null || _k === void 0 ? void 0 : _k.toString()) !== null && _l !== void 0 ? _l : ''}::${(_o = (_m = selectedAsset.longitude) === null || _m === void 0 ? void 0 : _m.toString()) !== null && _o !== void 0 ? _o : ''}`;
                        latitudeLongitudeElement.append(latitudeLongitudeOptionElement);
                    }
                }
            },
            onshown(modalElement, closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                mergeCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#assetMerge--categoryId').focus();
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doMergeAssets);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    function renderAssets() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        ;
        document.querySelector('#count--assets').textContent =
            Emile.assets.length.toString();
        assetsContainerElement.innerHTML = '';
        toggleMergeAssetsButton();
        if (Emile.assets.length === 0) {
            assetsContainerElement.innerHTML = `<div class="message is-warning">
        <p class="message-body">
          <strong>No Assets Found</strong><br />
          Get started by adding some assets that will be reported on.
        </p>
        </div>`;
            return;
        }
        const searchPieces = assetFilterElement.value
            .trim()
            .toLowerCase()
            .split(' ');
        const tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped has-sticky-header is-fade-hoverable';
        tableElement.innerHTML = `<thead><tr>
      ${Emile.canUpdate
            ? '<th class="has-width-10"><span class="is-sr-only">Select</span></th>'
            : ''}
      <th class="has-width-10"><span class="is-sr-only">Icon</span></th>
      <th>Category</th>
      <th>Asset</th>
      <th>Data From</th>
      <th>Data To</th>
      <th class="has-text-centered has-width-10">
        <i class="far fa-map" aria-hidden="true"></i>
        <span class="is-sr-only">Map</span>
      </th>
      </tr></thead>
      <tbody></tbody>`;
        // eslint-disable-next-line no-labels
        assetLoop: for (const asset of Emile.assets) {
            if (assetCategoryFilterElement.value !== '' &&
                assetCategoryFilterElement.value !== ((_a = asset.categoryId) === null || _a === void 0 ? void 0 : _a.toString())) {
                continue;
            }
            const searchText = `${asset.assetName} ${(_b = asset.category) !== null && _b !== void 0 ? _b : ''}`.toLowerCase();
            for (const searchPiece of searchPieces) {
                if (!searchText.includes(searchPiece)) {
                    // eslint-disable-next-line no-labels
                    continue assetLoop;
                }
            }
            const rowElement = document.createElement('tr');
            rowElement.dataset.assetId = (_d = (_c = asset.assetId) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
            if (Emile.canUpdate) {
                rowElement.innerHTML = `<td class="has-width-10 has-text-centered">
          <input class="selectedAssetId" id="selectedAssetId_${asset.assetId}" type="checkbox" value="${asset.assetId}" />
          </td>`;
            }
            const endTimeSecondsDate = new Date(((_e = asset.endTimeSecondsMax) !== null && _e !== void 0 ? _e : 0) * 1000);
            const highlightCell = asset.endTimeSecondsMax === null || Date.now() - endTimeSecondsDate.getTime() >= 32 * 86400 * 1000;
            rowElement.insertAdjacentHTML('beforeend', `<td class="has-width-10 has-text-centered">
        <i class="${(_f = asset.fontAwesomeIconClasses) !== null && _f !== void 0 ? _f : 'fas fa-bolt'}" aria-hidden="true"></i>
        </td>
        <td data-field="category"></td>
        <td><a data-field="assetName" href="#"></a></td>
        <td>
          ${asset.timeSecondsMin === null
                ? '<span class="has-text-grey">(No Data)</span>'
                : new Date(((_g = asset.timeSecondsMin) !== null && _g !== void 0 ? _g : 0) * 1000).toLocaleString()}
        </td>
        <td ${highlightCell ? ' class="has-background-warning" title="Past Date"' : ''}>
          ${asset.endTimeSecondsMax === null
                ? ''
                : endTimeSecondsDate.toLocaleString()}
        </td>
        <td class="has-width-10 has-text-centered has-text-nowrap">
          ${((_h = asset.latitude) !== null && _h !== void 0 ? _h : '') === '' || ((_j = asset.longitude) !== null && _j !== void 0 ? _j : '') === ''
                ? ''
                : `<a class="has-tooltip-left" data-tooltip="Open Map" href="${Emile.getMapLink(asset.latitude, asset.longitude)}" target="_blank" rel="noopener noreferrer" aria-label="Open Map">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                ${(_k = asset.latitude) !== null && _k !== void 0 ? _k : 0}, ${(_l = asset.longitude) !== null && _l !== void 0 ? _l : 0}
                </a>`}
        </td>`);
            rowElement.querySelector('[data-field="category"]').textContent = (_m = asset.category) !== null && _m !== void 0 ? _m : '';
            const assetNameElement = rowElement.querySelector('[data-field="assetName"]');
            assetNameElement.textContent = asset.assetName;
            assetNameElement.addEventListener('click', openAssetByClick);
            (_o = rowElement
                .querySelector('input')) === null || _o === void 0 ? void 0 : _o.addEventListener('change', toggleMergeAssetsButton);
            tableElement.querySelector('tbody').append(rowElement);
        }
        if (tableElement.querySelectorAll('tbody tr').length === 0) {
            assetsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
          <strong>There are no assets that meet your search criteria.</strong><br />
          Try to be less specific in your search. 
        </p>
        </div>`;
        }
        else {
            assetsContainerElement.append(tableElement);
        }
    }
    (_a = document.querySelector('#button--addAsset')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        let addAssetCloseModalFunction;
        function doAddAsset(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${Emile.urlPrefix}/assets/doAddAsset`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    Emile.assets = responseJSON.assets;
                    renderAssets();
                    addAssetCloseModalFunction();
                    openAssetByAssetId(responseJSON.assetId.toString());
                }
            });
        }
        cityssm.openHtmlModal('asset-add', {
            onshow(modalElement) {
                var _a, _b;
                const categoryElement = modalElement.querySelector('#assetAdd--categoryId');
                for (const category of Emile.assetCategories) {
                    const optionElement = document.createElement('option');
                    optionElement.value = (_b = (_a = category.categoryId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                    optionElement.textContent = category.category;
                    categoryElement.append(optionElement);
                }
            },
            onshown(modalElement, closeModalFunction) {
                var _a;
                addAssetCloseModalFunction = closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#assetAdd--categoryId').focus();
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddAsset);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    /*
     * Initialize
     */
    assetFilterElement.addEventListener('keyup', renderAssets);
    assetCategoryFilterElement.addEventListener('change', renderAssets);
    renderAssets();
})();
