"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a;
    const mainElement = document.querySelector('main');
    const urlPrefix = (_a = mainElement.dataset.urlPrefix) !== null && _a !== void 0 ? _a : '';
    const canUpdate = mainElement.dataset.canUpdate === 'true';
    /*
     * Unsaved Changes
     */
    let _hasUnsavedChanges = false;
    function setUnsavedChanges() {
        if (!hasUnsavedChanges()) {
            _hasUnsavedChanges = true;
            cityssm.enableNavBlocker();
        }
    }
    function clearUnsavedChanges() {
        _hasUnsavedChanges = false;
        cityssm.disableNavBlocker();
    }
    function hasUnsavedChanges() {
        return _hasUnsavedChanges;
    }
    /*
     * Map Link
     */
    function getMapLink(latitude, longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
    /*
     * Asset Selector
     */
    function initializeAssetSelector(assetSelectorOptions) {
        var _a, _b, _c;
        let assetSelectorCloseModalFunction;
        let assetFilterElement;
        let assetContainerElement;
        let assetGroupFilterElement;
        let assetGroupContainerElement;
        const iconContainerElement = assetSelectorOptions.assetSelectorElement.querySelector('.icon');
        const buttonElement = assetSelectorOptions.assetSelectorElement.querySelector('button');
        /*
         * Load assets
         */
        const assetIdElement = assetSelectorOptions.assetSelectorElement.querySelector('input[name="assetId"]');
        const allowAssetSelect = assetIdElement !== null;
        /*
         * Load asset groups
         */
        const groupIdElement = assetSelectorOptions.assetSelectorElement.querySelector('input[name="groupId"]');
        const allowGroupSelect = groupIdElement !== null;
        /*
         * Determine no selection text
         */
        let noSelectionText = (_a = buttonElement.dataset.noSelectionText) !== null && _a !== void 0 ? _a : '';
        if (noSelectionText === '' &&
            (assetIdElement === null || assetIdElement.value === '') &&
            (groupIdElement === null || groupIdElement.value === '')) {
            noSelectionText = (_b = buttonElement.textContent) !== null && _b !== void 0 ? _b : '';
        }
        if (noSelectionText === '' && allowGroupSelect) {
            noSelectionText = '(Select Assets)';
        }
        if (noSelectionText === '') {
            noSelectionText = '(Select Asset)';
        }
        /*
         * Functions
         */
        function selectAsset(clickEvent) {
            var _a, _b, _c, _d;
            clickEvent.preventDefault();
            const assetId = Number.parseInt((_a = clickEvent.currentTarget.dataset.assetId) !== null && _a !== void 0 ? _a : '', 10);
            const asset = Emile.assets.find((possibleAsset) => {
                return possibleAsset.assetId === assetId;
            });
            if (allowGroupSelect) {
                groupIdElement.value = '';
            }
            assetIdElement.value = (_c = (_b = asset.assetId) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : '';
            iconContainerElement.innerHTML = `<i class="${(_d = asset.fontAwesomeIconClasses) !== null && _d !== void 0 ? _d : 'fas fa-bolt'}" aria-hidden="true"></i>`;
            buttonElement.textContent = asset.assetName;
            assetSelectorCloseModalFunction();
            if (assetSelectorOptions.callbackFunction !== undefined) {
                assetSelectorOptions.callbackFunction({
                    type: 'asset',
                    assetId
                });
            }
        }
        function renderAssets() {
            var _a, _b, _c, _d;
            const panelElement = document.createElement('div');
            panelElement.className = 'panel';
            const searchPieces = assetFilterElement.value
                .trim()
                .toLowerCase()
                .split(' ');
            // eslint-disable-next-line no-labels
            assetLoop: for (const asset of Emile.assets) {
                const assetSearchString = `${asset.assetName} ${(_a = asset.category) !== null && _a !== void 0 ? _a : ''}`.toLowerCase();
                for (const searchPiece of searchPieces) {
                    if (!assetSearchString.includes(searchPiece)) {
                        // eslint-disable-next-line no-labels
                        continue assetLoop;
                    }
                }
                const panelBlockElement = document.createElement('a');
                panelBlockElement.className = 'panel-block is-block';
                panelBlockElement.href = '#';
                panelBlockElement.dataset.assetId = (_b = asset.assetId) === null || _b === void 0 ? void 0 : _b.toString();
                panelBlockElement.innerHTML = `<strong data-field="assetName"></strong><br />
          <i class="${(_c = asset.fontAwesomeIconClasses) !== null && _c !== void 0 ? _c : 'fas fa-bolt'}" aria-hidden="true"></i> <span class="is-size-7" data-field="category"></span>`;
                panelBlockElement.querySelector('[data-field="category"]').textContent = (_d = asset.category) !== null && _d !== void 0 ? _d : '';
                panelBlockElement.querySelector('[data-field="assetName"]').textContent = asset.assetName;
                panelBlockElement.addEventListener('click', selectAsset);
                panelElement.append(panelBlockElement);
            }
            if (panelElement.hasChildNodes()) {
                assetContainerElement.innerHTML = '';
                assetContainerElement.append(panelElement);
            }
            else {
                assetContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">
            There are no assets that meet your search criteria.
          </p>
          </div>`;
            }
        }
        function selectAssetGroup(clickEvent) {
            var _a, _b, _c;
            clickEvent.preventDefault();
            const groupId = Number.parseInt((_a = clickEvent.currentTarget.dataset.groupId) !== null && _a !== void 0 ? _a : '', 10);
            const assetGroup = Emile.assetGroups.find((possibleAssetGroup) => {
                return possibleAssetGroup.groupId === groupId;
            });
            if (allowAssetSelect) {
                assetIdElement.value = '';
            }
            groupIdElement.value = (_c = (_b = assetGroup.groupId) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : '';
            iconContainerElement.innerHTML =
                '<i class="fas fa-city" aria-hidden="true"></i>';
            buttonElement.textContent = assetGroup.groupName;
            assetSelectorCloseModalFunction();
            if (assetSelectorOptions.callbackFunction !== undefined) {
                assetSelectorOptions.callbackFunction({
                    type: 'assetGroup',
                    groupId
                });
            }
        }
        function renderAssetGroups() {
            var _a, _b, _c;
            const panelElement = document.createElement('div');
            panelElement.className = 'panel';
            const searchPieces = assetGroupFilterElement.value
                .trim()
                .toLowerCase()
                .split(' ');
            // eslint-disable-next-line no-labels
            assetGroupLoop: for (const assetGroup of Emile.assetGroups) {
                const assetGroupSearchString = `${assetGroup.groupName} ${(_a = assetGroup.groupDescription) !== null && _a !== void 0 ? _a : ''}`.toLowerCase();
                for (const searchPiece of searchPieces) {
                    if (!assetGroupSearchString.includes(searchPiece)) {
                        // eslint-disable-next-line no-labels
                        continue assetGroupLoop;
                    }
                }
                const panelBlockElement = document.createElement('a');
                panelBlockElement.className = 'panel-block is-block';
                panelBlockElement.href = '#';
                panelBlockElement.dataset.groupId = (_b = assetGroup.groupId) === null || _b === void 0 ? void 0 : _b.toString();
                panelBlockElement.innerHTML = `<i class="fas fa-city" aria-hidden="true"></i>
          <strong data-field="groupName"></strong><br />
          <span class="is-size-7" data-field="groupDescription"></span>`;
                panelBlockElement.querySelector('[data-field="groupName"]').textContent = (_c = assetGroup.groupName) !== null && _c !== void 0 ? _c : '';
                panelBlockElement.querySelector('[data-field="groupDescription"]').textContent = assetGroup.groupDescription;
                panelBlockElement.addEventListener('click', selectAssetGroup);
                panelElement.append(panelBlockElement);
            }
            if (panelElement.hasChildNodes()) {
                assetGroupContainerElement.innerHTML = '';
                assetGroupContainerElement.append(panelElement);
            }
            else {
                assetGroupContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">
            There are no asset groups that meet your search criteria.
          </p>
          </div>`;
            }
        }
        /*
         * Initialize buttons
         */
        buttonElement === null || buttonElement === void 0 ? void 0 : buttonElement.addEventListener('click', () => {
            cityssm.openHtmlModal('asset-select', {
                onshow(modalElement) {
                    var _a, _b, _c;
                    assetFilterElement = modalElement.querySelector('#assetSelector--assetFilter');
                    assetContainerElement = modalElement.querySelector('#assetSelectorContainer--assets');
                    assetGroupFilterElement = modalElement.querySelector('#assetSelector--assetGroupFilter');
                    assetGroupContainerElement = modalElement.querySelector('#assetSelectorContainer--assetGroups');
                    if (!allowAssetSelect || !allowGroupSelect) {
                        // Remove Tabs
                        (_a = modalElement.querySelector('.tabs')) === null || _a === void 0 ? void 0 : _a.remove();
                    }
                    else {
                        bulmaJS.init(modalElement);
                    }
                    if (!allowAssetSelect) {
                        // Remove Asset Tab Container
                        (_b = modalElement.querySelector('#assetSelectorTab--assets')) === null || _b === void 0 ? void 0 : _b.remove();
                        // Show Asset Groups Tab Container
                        (_c = modalElement
                            .querySelector('#assetSelectorTab--assetGroups')) === null || _c === void 0 ? void 0 : _c.classList.remove('is-hidden');
                        modalElement.querySelector('.modal-card-title').textContent = 'Select an Asset Group';
                    }
                },
                onshown(modalElement, closeModalFunction) {
                    assetSelectorCloseModalFunction = closeModalFunction;
                    bulmaJS.toggleHtmlClipped();
                    bulmaJS.init(modalElement);
                    if (allowAssetSelect) {
                        renderAssets();
                        assetFilterElement.addEventListener('keyup', renderAssets);
                    }
                    if (allowGroupSelect) {
                        renderAssetGroups();
                        assetGroupFilterElement.addEventListener('keyup', renderAssetGroups);
                    }
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        });
        (_c = assetSelectorOptions.assetSelectorElement
            .querySelector('.is-clear-button')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            if (allowAssetSelect) {
                assetIdElement.value = '';
            }
            if (allowGroupSelect) {
                groupIdElement.value = '';
            }
            iconContainerElement.innerHTML =
                '<i class="fas fa-bolt" aria-hidden="true"></i>';
            buttonElement.textContent = noSelectionText;
            if (assetSelectorOptions.callbackFunction !== undefined) {
                assetSelectorOptions.callbackFunction({ type: 'clear' });
            }
        });
    }
    /*
     * Build Global
     */
    const Emile = {
        urlPrefix,
        canUpdate,
        getMapLink,
        initializeAssetSelector,
        assets: [],
        assetGroups: [],
        assetCategories: [],
        setUnsavedChanges,
        clearUnsavedChanges,
        hasUnsavedChanges
    };
    // eslint-disable-next-line unicorn/prefer-module
    exports.Emile = Emile;
})();
