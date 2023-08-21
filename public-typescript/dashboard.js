"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b;
    const Emile = exports.Emile;
    const dashboardContainer = document.querySelector('#container--dashboard');
    const dashboardFormElement = document.querySelector('#form--dashboard');
    let charts = {};
    function getChartKey(assetId, dataTypeId) {
        return `${assetId}_${dataTypeId}`;
    }
    function formatDateLabel(timeSeconds) {
        return new Date(timeSeconds * 1000).toLocaleString();
    }
    function addDataToChart(chart, label, newData) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        chart.data.labels.push(label);
        for (const dataset of chart.data.datasets) {
            dataset.data.push(newData);
        }
    }
    function addDataToTable(table, data) {
        var _a, _b, _c, _d;
        const rowElement = document.createElement('tr');
        rowElement.innerHTML = `<td>${formatDateLabel(data.timeSeconds)}</td>
      <td>${(_a = data.readingType) !== null && _a !== void 0 ? _a : ''}</td>
      <td>${(_b = data.commodity) !== null && _b !== void 0 ? _b : ''}</td>
      <td class="has-text-right">${data.dataValue}</td>
      <td>${(_c = data.unit) !== null && _c !== void 0 ? _c : ''}</td>`;
        (_d = table.querySelector('tbody')) === null || _d === void 0 ? void 0 : _d.append(rowElement);
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
                    const panelElement = document.createElement('div');
                    panelElement.className = 'panel';
                    panelElement.innerHTML = `<div class="panel-heading">
              <div class="level is-mobile">
                <div class="level-left">
                  <div class="level-item">
                    <i class="${(_a = dataItem.fontAwesomeIconClasses) !== null && _a !== void 0 ? _a : 'fas fa-bolt'}" aria-hidden="true"></i>
                  </div>
                  <div class="level-item is-block">
                    <h2 class="has-text-weight-bold" data-field="assetName"></h2>
                    <span class="has-text-weight-normal" data-field="serviceCategory"></span>
                  </div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <div class="tabs is-toggle is-toggle-rounded">
                      <ul>
                        <li class="is-active">
                          <a href="#chartTab_${chartKey}">
                            <span class="icon is-small"><i class="fas fa-chart-bar" aria-hidden="true"></i></span>
                            <span>Chart</span>
                          </a>
                        </li>
                        <li>
                          <a href="#tableTab_${chartKey}">
                            <span class="icon is-small"><i class="fas fa-table" aria-hidden="true"></i></span>
                            <span>Table</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              </div>
              <div class="tabs-container panel-block is-block">
                <div id="chartTab_${chartKey}">
                  <canvas style="max-height:400px"></canvas>
                </div>
                <div id="tableTab_${chartKey}" class="is-hidden">
                  <table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Reading Type</th>
                        <th>Commodity</th>
                        <th class="has-text-right">Value</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
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
                    const table = panelElement.querySelector('table');
                    charts[chartKey] = {
                        chart,
                        table
                    };
                    addDataToTable(table, dataItem);
                }
                else {
                    addDataToChart(charts[chartKey].chart, formatDateLabel(dataItem.timeSeconds), dataItem.dataValue * Math.pow(10, dataItem.powerOfTenMultiplier));
                    addDataToTable(charts[chartKey].table, dataItem);
                }
            }
            for (const chart of Object.values(charts)) {
                chart.chart.update();
            }
            bulmaJS.init(dashboardContainer);
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
