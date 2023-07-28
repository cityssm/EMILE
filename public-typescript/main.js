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
     * Build Global
     */
    const Emile = {
        urlPrefix,
        canUpdate,
        getMapLink,
        setUnsavedChanges,
        clearUnsavedChanges,
        hasUnsavedChanges
    };
    // eslint-disable-next-line unicorn/prefer-module
    exports.Emile = Emile;
})();
