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
    const powerQueryRawReportUrlElement = document.querySelector('#powerQuery--reportUrlRaw');
    const powerQueryDailyReportUrlElement = document.querySelector('#powerQuery--reportUrlDaily');
    function refreshPowerQueryReportUrls() {
        const rawReportUrl = `${window.location.href.slice(0, Math.max(0, window.location.href.indexOf(window.location.pathname)))}${Emile.urlPrefix}/reports/energyData-fullyJoined?reportKey=${reportKey}`;
        powerQueryRawReportUrlElement.value = rawReportUrl;
        const dailyReportUrl = `${window.location.href.slice(0, Math.max(0, window.location.href.indexOf(window.location.pathname)))}${Emile.urlPrefix}/reports/energyData-fullyJoined-daily?reportKey=${reportKey}`;
        powerQueryDailyReportUrlElement.value = dailyReportUrl;
    }
    if (powerQueryTabElement !== null) {
        refreshPowerQueryReportUrls();
        powerQueryRawReportUrlElement.addEventListener('click', () => {
            powerQueryRawReportUrlElement.focus();
            powerQueryRawReportUrlElement.select();
        });
        powerQueryDailyReportUrlElement.addEventListener('click', () => {
            powerQueryDailyReportUrlElement.focus();
            powerQueryDailyReportUrlElement.select();
        });
    }
    // Initialize
    Emile.initializeAssetSelector({
        assetSelectorElement: document.querySelector('#reports--assetSelector')
    });
    bulmaJS.init();
})();
