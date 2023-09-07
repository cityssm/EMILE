// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'

import type { Emile as EmileGlobal } from './globalTypes.js'

declare const bulmaJS: BulmaJS
;(() => {
  const Emile = exports.Emile as EmileGlobal

  Emile.initializeAssetSelector({
    assetSelectorElement: document.querySelector(
      '#reports--assetSelector'
    ) as HTMLElement
  })

  bulmaJS.init()
})()
