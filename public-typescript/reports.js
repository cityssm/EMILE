"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a;
    const Emile = exports.Emile;
    // Power Query Tab
    const powerQueryTabElement = document.querySelector('#tab--powerQuery');
    const reportKey = (_a = powerQueryTabElement === null || powerQueryTabElement === void 0 ? void 0 : powerQueryTabElement.dataset.reportKey) !== null && _a !== void 0 ? _a : '';
    const powerQueryReportUrlElement = document.querySelector('#powerQuery--reportUrl');
    function refreshPowerQueryReportUrl() {
        const reportUrl = `${window.location.href.slice(0, Math.max(0, window.location.href.indexOf(window.location.pathname) + 1))}${Emile.urlPrefix}reports/energyData-fullyJoined?reportKey=${reportKey}`;
        powerQueryReportUrlElement.value = reportUrl;
    }
    if (powerQueryTabElement !== null) {
        refreshPowerQueryReportUrl();
        powerQueryReportUrlElement.addEventListener('click', () => {
            powerQueryReportUrlElement.focus();
            powerQueryReportUrlElement.select();
        });
    }
    // Initialize
    Emile.initializeAssetSelector({
        assetSelectorElement: document.querySelector('#reports--assetSelector')
    });
    bulmaJS.init();
})();
