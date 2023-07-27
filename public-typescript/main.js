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
    const Emile = {
        urlPrefix,
        canUpdate,
        setUnsavedChanges,
        clearUnsavedChanges,
        hasUnsavedChanges
    };
    // eslint-disable-next-line unicorn/prefer-module
    exports.Emile = Emile;
})();
