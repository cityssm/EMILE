// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { Chart } from 'chart.js'

import type { EnergyData } from '../types/recordTypes.js'

import type { Emile as EmileGlobal } from './globalTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const Emile = exports.Emile as EmileGlobal

  const dashboardContainer = document.querySelector(
    '#container--dashboard'
  ) as HTMLElement

  const dashboardFormElement = document.querySelector(
    '#form--dashboard'
  ) as HTMLFormElement

  const startDateStringElement = dashboardFormElement.querySelector(
    '#dashboard--startDateString'
  ) as HTMLInputElement

  const endDateStringElement = dashboardFormElement.querySelector(
    '#dashboard--endDateString'
  ) as HTMLInputElement

  let charts: Record<
    string,
    {
      chart: Chart
      table: HTMLTableElement
      exportLink: HTMLAnchorElement
      assetId: number
      dataTypeId: number
      timeSecondsMin: number
      timeSecondsMax: number
    }
  > = {}

  function getChartKey(assetId: number, dataTypeId: number): string {
    return `${assetId}_${dataTypeId}`
  }

  function formatDateLabel(timeSeconds: number): string {
    return new Date(timeSeconds * 1000).toLocaleString()
  }

  function addDataToChart(chart: Chart, label: unknown, newData: number): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    chart.data.labels!.push(label)

    for (const dataset of chart.data.datasets) {
      dataset.data.push(newData)
    }
  }

  function addDataToTable(table: HTMLTableElement, data: EnergyData): void {
    const rowElement = document.createElement('tr')

    rowElement.innerHTML = `<td>${formatDateLabel(data.timeSeconds)}</td>
      <td>${data.readingType ?? ''}</td>
      <td>${data.commodity ?? ''}</td>
      <td class="has-text-right">${data.dataValue * Math.pow(10, data.powerOfTenMultiplier)}</td>
      <td>${data.unit ?? ''}</td>`

    table.querySelector('tbody')?.append(rowElement)
  }

  function getEnergyData(): void {
    if (startDateStringElement.value > endDateStringElement.value) {
      dashboardContainer.innerHTML = `<div class="message is-warning">
        <p class="message-body">The start date must be less than or equal to the end date.</p>
        </div>`

      return
    }

    dashboardContainer.innerHTML = `<p class="has-text-centered has-text-grey">
      <i class="fas fa-pulse fa-spinner fa-4x" aria-hidden="true"></i><br />
      Loading data...
      </p>`

    cityssm.postJSON(
      `${Emile.urlPrefix}/dashboard/doGetEnergyData`,
      dashboardFormElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          energyData: EnergyData[]
        }

        dashboardContainer.innerHTML = ''
        charts = {}

        if (responseJSON.energyData.length === 0) {
          dashboardContainer.innerHTML = `<div class="message is-info">
            <p class="message-body">There is no energy data that meets your search criteria.</p>
            </div>`
        }

        for (const dataItem of responseJSON.energyData) {
          const chartKey = getChartKey(
            dataItem.assetId as number,
            dataItem.dataTypeId as number
          )

          if (charts[chartKey] === undefined) {
            const panelElement = document.createElement('div')
            panelElement.className = 'panel'

            panelElement.innerHTML = `<div class="panel-heading">
              <div class="level is-mobile">
                <div class="level-left">
                  <div class="level-item">
                    <i class="${
                      dataItem.fontAwesomeIconClasses ?? 'fas fa-bolt'
                    }" aria-hidden="true"></i>
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
              </div>`
            ;(
              panelElement.querySelector(
                '[data-field="assetName"]'
              ) as HTMLElement
            ).textContent = dataItem.assetName ?? ''
            ;(
              panelElement.querySelector(
                '[data-field="serviceCategory"]'
              ) as HTMLElement
            ).textContent = dataItem.serviceCategory ?? ''

            dashboardContainer.append(panelElement)

            const chart = new Chart(
              panelElement.querySelector('canvas') as HTMLCanvasElement,
              {
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
              }
            )

            const table = panelElement.querySelector(
              'table'
            ) as HTMLTableElement

            charts[chartKey] = {
              chart,
              table,
              exportLink: dashboardContainer.querySelector(
                '.is-export-link'
              ) as HTMLAnchorElement,
              assetId: dataItem.assetId as number,
              dataTypeId: dataItem.dataTypeId as number,
              timeSecondsMin: dataItem.timeSeconds,
              timeSecondsMax: dataItem.timeSeconds
            }

            addDataToTable(table, dataItem)
          } else {
            addDataToChart(
              charts[chartKey].chart,
              formatDateLabel(dataItem.timeSeconds),
              dataItem.dataValue * Math.pow(10, dataItem.powerOfTenMultiplier)
            )

            addDataToTable(charts[chartKey].table, dataItem)

            charts[chartKey].timeSecondsMin = Math.min(
              charts[chartKey].timeSecondsMin,
              dataItem.timeSeconds
            )
            charts[chartKey].timeSecondsMax = Math.max(
              charts[chartKey].timeSecondsMax,
              dataItem.timeSeconds
            )
          }
        }

        for (const chart of Object.values(charts)) {
          chart.chart.update()
          chart.exportLink.href = `${Emile.urlPrefix}/reports/energyData-formatted-filtered/?assetId=${chart.assetId}&dataTypeId=${chart.dataTypeId}&timeSecondsMin=${chart.timeSecondsMin}&timeSecondsMax=${chart.timeSecondsMax}`
        }

        bulmaJS.init(dashboardContainer)
      }
    )
  }

  /*
   * Initialize
   */

  Emile.initializeAssetSelector({
    assetSelectorElement: dashboardFormElement.querySelector(
      '#dashboard--assetSelector'
    ) as HTMLElement,
    callbackFunction: getEnergyData
  })

  startDateStringElement.addEventListener('change', getEnergyData)

  endDateStringElement.addEventListener('change', getEnergyData)

  dashboardFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
    getEnergyData()
  })

  getEnergyData()
})()
