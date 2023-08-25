"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const Emile = exports.Emile;
    const dashboardContainer = document.querySelector('#container--dashboard');
    const dashboardFormElement = document.querySelector('#form--dashboard');
    const startDateStringElement = dashboardFormElement.querySelector('#dashboard--startDateString');
    const endDateStringElement = dashboardFormElement.querySelector('#dashboard--endDateString');
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
      <td class="has-text-right">${data.dataValue * Math.pow(10, data.powerOfTenMultiplier)}</td>
      <td>${(_c = data.unit) !== null && _c !== void 0 ? _c : ''}</td>`;
        (_d = table.querySelector('tbody')) === null || _d === void 0 ? void 0 : _d.append(rowElement);
    }
    function getEnergyData() {
        if (startDateStringElement.value > endDateStringElement.value) {
            dashboardContainer.innerHTML = `<div class="message is-warning">
        <p class="message-body">The start date must be less than or equal to the end date.</p>
        </div>`;
            return;
        }
        dashboardContainer.innerHTML = `<p class="has-text-centered has-text-grey">
      <i class="fas fa-pulse fa-spinner fa-4x" aria-hidden="true"></i><br />
      Loading data...
      </p>`;
        cityssm.postJSON(`${Emile.urlPrefix}/dashboard/doGetEnergyData`, dashboardFormElement, (rawResponseJSON) => {
            var _a, _b, _c;
            const responseJSON = rawResponseJSON;
            dashboardContainer.innerHTML = '';
            charts = {};
            if (responseJSON.energyData.length === 0) {
                dashboardContainer.innerHTML = `<div class="message is-info">
            <p class="message-body">There is no energy data that meets your search criteria.</p>
            </div>`;
            }
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
                    <div class="tabs is-toggle is-toggle-rounded has-text-weight-normal">
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
                  <div class="level-item">
                    <a class="button is-export-link" download>
                      <span class="icon is-small"><i class="fas fa-file-csv" aria-hidden="true"></i></span>
                      <span class="has-text-weight-normal">Export</span>
                    </a>
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
                        table,
                        exportLink: dashboardContainer.querySelector('.is-export-link'),
                        assetId: dataItem.assetId,
                        dataTypeId: dataItem.dataTypeId,
                        timeSecondsMin: dataItem.timeSeconds,
                        timeSecondsMax: dataItem.timeSeconds
                    };
                    addDataToTable(table, dataItem);
                }
                else {
                    addDataToChart(charts[chartKey].chart, formatDateLabel(dataItem.timeSeconds), dataItem.dataValue * Math.pow(10, dataItem.powerOfTenMultiplier));
                    addDataToTable(charts[chartKey].table, dataItem);
                    charts[chartKey].timeSecondsMin = Math.min(charts[chartKey].timeSecondsMin, dataItem.timeSeconds);
                    charts[chartKey].timeSecondsMax = Math.max(charts[chartKey].timeSecondsMax, dataItem.timeSeconds);
                }
            }
            for (const chart of Object.values(charts)) {
                chart.chart.update();
                chart.exportLink.href = `${Emile.urlPrefix}/reports/energyData-formatted-filtered/?assetId=${chart.assetId}&dataTypeId=${chart.dataTypeId}&timeSecondsMin=${chart.timeSecondsMin}&timeSecondsMax=${chart.timeSecondsMax}`;
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
    startDateStringElement.addEventListener('change', getEnergyData);
    endDateStringElement.addEventListener('change', getEnergyData);
    dashboardFormElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        getEnergyData();
    });
    getEnergyData();
})();
