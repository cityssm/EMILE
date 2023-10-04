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

  const powerQueryReportUrlElement = document.querySelector(
    '#powerQuery--reportUrl'
  ) as HTMLTextAreaElement

  function refreshPowerQueryReportUrl(): void {
    const reportUrl = `${window.location.href.slice(
      0,
      Math.max(0, window.location.href.indexOf(window.location.pathname))
    )}${Emile.urlPrefix}/reports/energyData-fullyJoined?reportKey=${reportKey}`

    powerQueryReportUrlElement.value = reportUrl
  }

  if (powerQueryTabElement !== null) {
    refreshPowerQueryReportUrl()

    powerQueryReportUrlElement.addEventListener('click', () => {
      powerQueryReportUrlElement.focus()
      powerQueryReportUrlElement.select()
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
