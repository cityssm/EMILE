// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'

import type { Emile as EmileGlobal } from './globalTypes.js'

declare const bulmaJS: BulmaJS
;(() => {
  const Emile = exports.Emile as EmileGlobal

  // Power Query Tab

  const powerQueryTabElement = document.querySelector('#tab--powerQuery')

  const reportKey =
    (powerQueryTabElement as HTMLElement)?.dataset.reportKey ?? ''

  const powerQueryRawReportUrlElement = document.querySelector(
    '#powerQuery--reportUrlRaw'
  ) as HTMLTextAreaElement

  const powerQueryDailyReportUrlElement = document.querySelector(
    '#powerQuery--reportUrlDaily'
  ) as HTMLTextAreaElement

  function refreshPowerQueryReportUrls(): void {
    const rawReportUrl = `${window.location.href.slice(
      0,
      Math.max(0, window.location.href.indexOf(window.location.pathname))
    )}${Emile.urlPrefix}/reports/energyData-fullyJoined?reportKey=${reportKey}`

    powerQueryRawReportUrlElement.value = rawReportUrl

    const dailyReportUrl = `${window.location.href.slice(
      0,
      Math.max(0, window.location.href.indexOf(window.location.pathname))
    )}${
      Emile.urlPrefix
    }/reports/energyData-fullyJoined-daily?reportKey=${reportKey}`

    powerQueryDailyReportUrlElement.value = dailyReportUrl
  }

  if (powerQueryTabElement !== null) {
    refreshPowerQueryReportUrls()

    powerQueryRawReportUrlElement.addEventListener('click', () => {
      powerQueryRawReportUrlElement.focus()
      powerQueryRawReportUrlElement.select()
    })

    powerQueryDailyReportUrlElement.addEventListener('click', () => {
      powerQueryDailyReportUrlElement.focus()
      powerQueryDailyReportUrlElement.select()
    })
  }

  // Initialize

  Emile.initializeAssetSelector({
    assetSelectorElement: document.querySelector(
      '#reports--assetSelector'
    ) as HTMLElement
  })

  bulmaJS.init()
})()
