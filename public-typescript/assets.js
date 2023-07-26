"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a;
    const Emile = exports.Emile;
    const assetCategories = exports.assetCategories;
    delete exports.assetCategories;
    let assets = exports.assets;
    delete exports.assets;
    const assetFilterElement = document.querySelector('#filter--assets');
    function renderAssets() {
        var _a, _b;
        const countElement = document.querySelector('#count--assets');
        const containerElement = document.querySelector('#container--assets');
        if (assets.length === 0) {
            countElement.textContent = assets.length.toString();
            containerElement.innerHTML = `<div class="message is-warning">
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
        tableElement.className = 'table is-fullwidth is-striped has-sticky-header';
        tableElement.innerHTML = `<thead><tr>
      <th>Asset</th>
      <th>Category</th>
      </tr></thead>
      <tbody></tbody>`;
        // eslint-disable-next-line no-labels
        assetLoop: for (const asset of assets) {
            const searchText = asset.assetName.toLowerCase() +
                ' ' +
                ((_a = asset.category) !== null && _a !== void 0 ? _a : '').toLowerCase();
            for (const searchPiece of searchPieces) {
                if (!searchText.includes(searchPiece)) {
                    // eslint-disable-next-line no-labels
                    continue assetLoop;
                }
            }
            const rowElement = document.createElement('tr');
            rowElement.innerHTML = `<td>${asset.assetName}</td>
        <td>${(_b = asset.category) !== null && _b !== void 0 ? _b : ''}</td>`;
            tableElement.querySelector('tbody').append(rowElement);
        }
        const displayCount = tableElement.querySelectorAll('tbody tr').length;
        countElement.textContent = displayCount.toString();
        if (displayCount === 0) {
            containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
          <strong>There are no assets that meet your search criteria.</strong><br />
          Try to be less specific in your search. 
        </p>
        </div>`;
        }
        else {
            containerElement.innerHTML = '';
            containerElement.append(tableElement);
        }
    }
    (_a = document.querySelector('#button--addAsset')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        let addAssetCloseModalFunction;
        function doAddAsset(formEvent) {
            formEvent.preventDefault();
        }
        cityssm.openHtmlModal('asset-add', {
            onshow(modalElement) {
                var _a, _b;
                const categoryElement = modalElement.querySelector('#assetAdd--categoryId');
                for (const category of assetCategories) {
                    const optionElement = document.createElement('option');
                    optionElement.value = (_b = (_a = category.categoryId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                    optionElement.textContent = category.category;
                    categoryElement.append(optionElement);
                }
            },
            onshown(modalElement, closeModalFunction) {
                var _a;
                addAssetCloseModalFunction = closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddAsset);
            }
        });
    });
    let assetGroups = exports.assetGroups;
    delete exports.assetGroups;
    /*
     * Initialize
     */
    // Initialize tabs
    bulmaJS.init();
    // Assets
    assetFilterElement.addEventListener('keyup', renderAssets);
    renderAssets();
})();
