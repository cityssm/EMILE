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

  let charts: Record<string, Chart> = {}

  function getChartKey(assetId: number, dataTypeId: number): string {
    return `${assetId}::${dataTypeId}`
  }

  function formatDateLabel(timeSeconds: number): string {
    return new Date(timeSeconds * 1000).toLocaleString()
  }

  function addDataToChart(chart: Chart, label: any, newData: number): void {
    chart.data.labels!.push(label)

    for (const dataset of chart.data.datasets) {
      dataset.data.push(newData)
    }
  }

  function getEnergyData(): void {
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

        for (const dataItem of responseJSON.energyData) {
          const chartKey = getChartKey(
            dataItem.assetId as number,
            dataItem.dataTypeId as number
          )

          if (charts[chartKey] === undefined) {
            console.log(dataItem)

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

            charts[chartKey] = chart
          } else {
            addDataToChart(
              charts[chartKey],
              formatDateLabel(dataItem.timeSeconds),
              dataItem.dataValue * Math.pow(10, dataItem.powerOfTenMultiplier)
            )
          }
        }

        for (const chart of Object.values(charts)) {
          chart.update()
        }
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

  dashboardFormElement
    .querySelector('#dashboard--startDateString')
    ?.addEventListener('change', getEnergyData)

  dashboardFormElement
    .querySelector('#dashboard--endDateString')
    ?.addEventListener('change', getEnergyData)

  dashboardFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
    getEnergyData()
  })

  getEnergyData()
})()
