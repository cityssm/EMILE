// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

import type { Emile as EmileGlobal } from '../types/globalTypes.js'

;(() => {
  const Emile = exports.Emile as EmileGlobal

  Emile.initializeAssetSelector({
    assetSelectorElement: document.querySelector(
      '#dashboard--assetSelector'
    ) as HTMLElement
  })
})()
