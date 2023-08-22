// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

import type { Emile as EmileGlobal } from './globalTypes.js'

;(() => {
  const Emile = exports.Emile as EmileGlobal

  Emile.initializeAssetSelector({
    assetSelectorElement: document.querySelector(
      '#reports--assetSelector'
    ) as HTMLElement
  })
})()
