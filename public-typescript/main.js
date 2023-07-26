"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a;
    const urlPrefix = (_a = document.querySelector('main').dataset.urlPrefix) !== null && _a !== void 0 ? _a : '';
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
        setUnsavedChanges,
        clearUnsavedChanges,
        hasUnsavedChanges
    };
    // eslint-disable-next-line unicorn/prefer-module
    exports.Emile = Emile;
})();
