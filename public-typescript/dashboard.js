"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const Emile = exports.Emile;
    const dashboardContainer = document.querySelector('#container--dashboard');
    const dashboardFormElement = document.querySelector('#form--dashboard');
    // Start Date
    const startDateStringElementId = 'dashboard--startDateString';
    const startDateStringElement = dashboardFormElement.querySelector(`#${startDateStringElementId}`);
    const savedStartDateStringValue = sessionStorage.getItem(startDateStringElementId);
    if (savedStartDateStringValue !== null) {
        startDateStringElement.value = savedStartDateStringValue;
    }
    // End Date
    const endDateStringElementId = 'dashboard--endDateString';
    const endDateStringElement = dashboardFormElement.querySelector(`#${endDateStringElementId}`);
    const savedEndDateStringValue = sessionStorage.getItem(endDateStringElementId);
    if (savedEndDateStringValue !== null) {
        endDateStringElement.value = savedEndDateStringValue;
    }
    const submitButtonElement = dashboardFormElement.querySelector('button[type="submit"]');
    let charts = {};
    function getChartKey(assetId, dataTypeId) {
        return `${assetId}_${dataTypeId}`;
    }
    function formatDateLabel(timeSeconds) {
        return new Date(timeSeconds * 1000).toLocaleString();
    }
    function formatDurationSeconds(durationSeconds) {
        let currentDuration = durationSeconds;
        let currentUnit = 's';
        // to minutes
        if (currentDuration >= 60) {
            currentDuration = currentDuration / 60;
            currentUnit = 'min';
        }
        else {
            return `${currentDuration} ${currentUnit}`;
        }
        // to hours
        if (currentDuration >= 60) {
            currentDuration = currentDuration / 60;
            currentUnit = 'hr';
        }
        else {
            return `${currentDuration} ${currentUnit}`;
        }
        // to days
        if (currentDuration >= 24) {
            currentDuration = currentDuration / 24;
            currentUnit = 'days';
        }
        return `${currentDuration} ${currentUnit}`;
    }
    function addDataToChart(chart, label, newData) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        chart.data.labels.push(label);
        for (const dataset of chart.data.datasets) {
            dataset.data.push(newData);
        }
    }
    function addDataToTable(table, data) {
        var _a, _b, _c, _d, _e;
        const rowElement = document.createElement('tr');
        rowElement.innerHTML = `<td>${formatDateLabel(data.timeSeconds)}</td>
      <td>${formatDurationSeconds(data.durationSeconds)}</td>
      <td>${(_a = data.readingType) !== null && _a !== void 0 ? _a : ''}</td>
      <td>${(_b = data.commodity) !== null && _b !== void 0 ? _b : ''}</td>
      <td class="has-text-right">${data.dataValue}</td>
      <td>${(_c = data.powerOfTenMultiplierName) !== null && _c !== void 0 ? _c : ''}</td>
      <td>${(_d = data.unit) !== null && _d !== void 0 ? _d : ''}</td>`;
        (_e = table.querySelector('tbody')) === null || _e === void 0 ? void 0 : _e.append(rowElement);
    }
    function getEnergyData() {
        if (startDateStringElement.value > endDateStringElement.value) {
            dashboardContainer.innerHTML = `<div class="message is-warning">
        <p class="message-body">The start date must be less than or equal to the end date.</p>
        </div>`;
            return;
        }
        submitButtonElement.disabled = true;
        dashboardContainer.innerHTML = `<p class="has-text-centered has-text-grey">
      <i class="fas fa-pulse fa-spinner fa-4x" aria-hidden="true"></i><br />
      Loading data...
      </p>`;
        sessionStorage.setItem(startDateStringElementId, startDateStringElement.value);
        sessionStorage.setItem(endDateStringElementId, endDateStringElement.value);
        cityssm.postJSON(`${Emile.urlPrefix}/dashboard/doGetEnergyData`, dashboardFormElement, (rawResponseJSON) => {
            var _a, _b, _c, _d, _e, _f;
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
                const dataValue = (dataItem.dataValue * Math.pow(10, dataItem.powerOfTenMultiplier)) /
                    Math.pow(10, (_a = dataItem.preferredPowerOfTenMultiplier) !== null && _a !== void 0 ? _a : 0);
                const dataUnit = `${(_b = dataItem.preferredPowerOfTenMultiplierName) !== null && _b !== void 0 ? _b : ''} ${(_c = dataItem.unit) !== null && _c !== void 0 ? _c : ''}`;
                if (charts[chartKey] === undefined) {
                    const panelElement = document.createElement('div');
                    panelElement.className = 'panel';
                    panelElement.innerHTML = `<div class="panel-heading">
              <div class="level is-mobile">
                <div class="level-left">
                  <div class="level-item">
                    <i class="${(_d = dataItem.fontAwesomeIconClasses) !== null && _d !== void 0 ? _d : 'fas fa-bolt'}" aria-hidden="true"></i>
                  </div>
                  <div class="level-item is-block">
                    <h2 class="has-text-weight-bold" data-field="assetName"></h2>
                    <span class="has-text-weight-normal" data-field="serviceCategory"></span>
                  </div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <div class="tabs is-toggle is-toggle-rounded has-text-weight-normal">
                      <ul role="presentation">
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
                        <th>Duration</th>
                        <th>Reading Type</th>
                        <th>Commodity</th>
                        <th class="has-text-right">Value</th>
                        <th colspan="2">Unit</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>`;
                    panelElement.querySelector('[data-field="assetName"]').textContent = (_e = dataItem.assetName) !== null && _e !== void 0 ? _e : '';
                    panelElement.querySelector('[data-field="serviceCategory"]').textContent = (_f = dataItem.serviceCategory) !== null && _f !== void 0 ? _f : '';
                    dashboardContainer.append(panelElement);
                    const chart = new Chart(panelElement.querySelector('canvas'), {
                        type: 'bar',
                        data: {
                            labels: [formatDateLabel(dataItem.timeSeconds)],
                            datasets: [
                                {
                                    label: dataUnit,
                                    data: [dataValue]
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
                    addDataToChart(charts[chartKey].chart, formatDateLabel(dataItem.timeSeconds), dataValue);
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
    function enableSubmitButton() {
        submitButtonElement.disabled = false;
    }
    /*
     * Initialize
     */
    Emile.initializeAssetSelector({
        assetSelectorElement: dashboardFormElement.querySelector('#dashboard--assetSelector'),
        callbackFunction: getEnergyData
    });
    startDateStringElement.addEventListener('change', enableSubmitButton);
    endDateStringElement.addEventListener('change', enableSubmitButton);
    dashboardFormElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        getEnergyData();
    });
    getEnergyData();
})();
