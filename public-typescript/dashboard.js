"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b;
    const Emile = exports.Emile;
    const dashboardContainer = document.querySelector('#container--dashboard');
    const dashboardFormElement = document.querySelector('#form--dashboard');
    let charts = {};
    function getChartKey(assetId, dataTypeId) {
        return `${assetId}::${dataTypeId}`;
    }
    function formatDateLabel(timeSeconds) {
        return new Date(timeSeconds * 1000).toLocaleString();
    }
    function addDataToChart(chart, label, newData) {
        chart.data.labels.push(label);
        for (const dataset of chart.data.datasets) {
            dataset.data.push(newData);
        }
    }
    function getEnergyData() {
        dashboardContainer.innerHTML = `<p class="has-text-centered has-text-grey">
      <i class="fas fa-pulse fa-spinner fa-4x" aria-hidden="true"></i><br />
      Loading data...
      </p>`;
        cityssm.postJSON(`${Emile.urlPrefix}/dashboard/doGetEnergyData`, dashboardFormElement, (rawResponseJSON) => {
            var _a, _b, _c;
            const responseJSON = rawResponseJSON;
            dashboardContainer.innerHTML = '';
            charts = {};
            for (const dataItem of responseJSON.energyData) {
                const chartKey = getChartKey(dataItem.assetId, dataItem.dataTypeId);
                if (charts[chartKey] === undefined) {
                    console.log(dataItem);
                    const panelElement = document.createElement('div');
                    panelElement.className = 'panel';
                    panelElement.innerHTML = `<div class="panel-heading">
              <div class="level is-mobile">
                <div class="level-left">
                  <div class="level-item">
                    <i class="${(_a = dataItem.fontAwesomeIconClasses) !== null && _a !== void 0 ? _a : 'fas fa-bolt'}" aria-hidden="true"></i>
                  </div>
                  <div class="level-item">
                    <h2 class="has-text-weight-bold" data-field="assetName"></h2>
                  </div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <span class="has-text-weight-normal" data-field="serviceCategory"></span>
                  </div>
                </div>
              </div>
              </div>
              <div class="panel-block is-block">
              <canvas style="max-height:400px"></canvas>
              </div>`;
                    panelElement.querySelector('[data-field="assetName"]').textContent = (_b = dataItem.assetName) !== null && _b !== void 0 ? _b : '';
                    panelElement.querySelector('[data-field="serviceCategory"]').textContent = (_c = dataItem.serviceCategory) !== null && _c !== void 0 ? _c : '';
                    dashboardContainer.append(panelElement);
                    const chart = new Chart(panelElement.querySelector('canvas'), {
                        type: 'bar',
                        data: {
                            labels: [formatDateLabel(dataItem.timeSeconds)],
                            datasets: [
                                {
                                    label: dataItem.unit,
                                    data: [
                                        dataItem.dataValue *
                                            Math.pow(10, dataItem.powerOfTenMultiplier)
                                    ]
                                }
                            ]
                        }
                    });
                    charts[chartKey] = chart;
                }
                else {
                    addDataToChart(charts[chartKey], formatDateLabel(dataItem.timeSeconds), dataItem.dataValue * Math.pow(10, dataItem.powerOfTenMultiplier));
                }
            }
            for (const chart of Object.values(charts)) {
                chart.update();
            }
        });
    }
    /*
     * Initialize
     */
    Emile.initializeAssetSelector({
        assetSelectorElement: dashboardFormElement.querySelector('#dashboard--assetSelector'),
        callbackFunction: getEnergyData
    });
    (_a = dashboardFormElement
        .querySelector('#dashboard--startDateString')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', getEnergyData);
    (_b = dashboardFormElement
        .querySelector('#dashboard--endDateString')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', getEnergyData);
    dashboardFormElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        getEnergyData();
    });
    getEnergyData();
})();
