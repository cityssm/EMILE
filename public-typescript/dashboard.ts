// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'
import type { Chart as ChartJS } from 'chart.js'

import type { EnergyData } from '../types/recordTypes.js'

import type { Emile as EmileGlobal } from './globalTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
declare const Chart: ChartJS

  // eslint-disable-next-line sonarjs/cognitive-complexity
;(() => {
  const Emile = exports.Emile as EmileGlobal

  const dashboardContainer = document.querySelector(
    '#container--dashboard'
  ) as HTMLElement

  const dashboardFormElement = document.querySelector(
    '#form--dashboard'
  ) as HTMLFormElement

  // Start Date

  const startDateStringElementId = 'dashboard--startDateString'

  const startDateStringElement = dashboardFormElement.querySelector(
    `#${startDateStringElementId}`
  ) as HTMLInputElement

  const savedStartDateStringValue = sessionStorage.getItem(
    startDateStringElementId
  )

  if (savedStartDateStringValue !== null) {
    startDateStringElement.value = savedStartDateStringValue
  }

  // End Date

  const endDateStringElementId = 'dashboard--endDateString'

  const endDateStringElement = dashboardFormElement.querySelector(
    `#${endDateStringElementId}`
  ) as HTMLInputElement

  const savedEndDateStringValue = sessionStorage.getItem(endDateStringElementId)

  if (savedEndDateStringValue !== null) {
    endDateStringElement.value = savedEndDateStringValue
  }

  const submitButtonElement = dashboardFormElement.querySelector(
    'button[type="submit"]'
  ) as HTMLButtonElement

  let charts: Record<
    string,
    {
      chart: ChartJS
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

  function formatDurationSeconds(durationSeconds: number): string {
    let currentDuration = durationSeconds
    let currentUnit = 's'

    // to minutes
    if (currentDuration >= 60) {
      currentDuration = currentDuration / 60
      currentUnit = 'min'
    } else {
      return `${currentDuration} ${currentUnit}`
    }

    // to hours
    if (currentDuration >= 60) {
      currentDuration = currentDuration / 60
      currentUnit = 'hr'
    } else {
      return `${currentDuration} ${currentUnit}`
    }

    // to days
    if (currentDuration >= 24) {
      currentDuration = currentDuration / 24
      currentUnit = 'days'
    }

    return `${currentDuration} ${currentUnit}`
  }

  function addDataToChart(
    chart: ChartJS,
    label: unknown,
    newData: number
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    chart.data.labels!.push(label)

    for (const dataset of chart.data.datasets) {
      dataset.data.push(newData)
    }
  }

  function addDataToTable(table: HTMLTableElement, data: EnergyData): void {
    const rowElement = document.createElement('tr')

    rowElement.innerHTML = `<td>${formatDateLabel(data.timeSeconds)}</td>
      <td>${formatDurationSeconds(data.durationSeconds)}</td>
      <td>${data.readingType ?? ''}</td>
      <td>${data.commodity ?? ''}</td>
      <td class="has-text-right">${data.dataValue}</td>
      <td>${data.powerOfTenMultiplierName ?? ''}</td>
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

    submitButtonElement.disabled = true

    dashboardContainer.innerHTML = `<p class="has-text-centered has-text-grey">
      <i class="fas fa-pulse fa-spinner fa-4x" aria-hidden="true"></i><br />
      Loading data...
      </p>`

    sessionStorage.setItem(
      startDateStringElementId,
      startDateStringElement.value
    )
    sessionStorage.setItem(endDateStringElementId, endDateStringElement.value)

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

        const panelContainerElement = document.createElement('div')

        for (const dataItem of responseJSON.energyData) {
          const chartKey = getChartKey(
            dataItem.assetId as number,
            dataItem.dataTypeId as number
          )

          const dataValue =
            (dataItem.dataValue * Math.pow(10, dataItem.powerOfTenMultiplier)) /
            Math.pow(10, dataItem.preferredPowerOfTenMultiplier ?? 0)

          const dataUnit = `${
            dataItem.preferredPowerOfTenMultiplierName ?? ''
          } ${dataItem.unit ?? ''}`

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

            panelContainerElement.append(panelElement)

            const chart = new Chart(
              panelElement.querySelector('canvas') as HTMLCanvasElement,
              {
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
              }
            )

            const table = panelElement.querySelector(
              'table'
            ) as HTMLTableElement

            charts[chartKey] = {
              chart,
              table,
              exportLink: panelElement.querySelector(
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
              dataValue
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

        dashboardContainer.append(panelContainerElement)

        for (const chart of Object.values(charts)) {
          chart.chart.update()
          chart.exportLink.href = `${Emile.urlPrefix}/reports/energyData-formatted-filtered/?assetId=${chart.assetId}&dataTypeId=${chart.dataTypeId}&timeSecondsMin=${chart.timeSecondsMin}&timeSecondsMax=${chart.timeSecondsMax}`
        }

        bulmaJS.init(dashboardContainer)
      }
    )
  }

  function enableSubmitButton(): void {
    submitButtonElement.disabled = false
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

  startDateStringElement.addEventListener('change', enableSubmitButton)

  endDateStringElement.addEventListener('change', enableSubmitButton)

  dashboardFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
    getEnergyData()
  })

  getEnergyData()
})()
