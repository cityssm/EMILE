import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Emile as EmileGlobal } from '../types/globalTypes.js'

declare const cityssm: cityssmGlobal

;(() => {
  const urlPrefix =
    (document.querySelector('main') as HTMLElement).dataset.urlPrefix ?? ''

  /*
   * Unsaved Changes
   */

  let _hasUnsavedChanges = false

  function setUnsavedChanges(): void {
    if (!hasUnsavedChanges()) {
      _hasUnsavedChanges = true
      cityssm.enableNavBlocker()
    }
  }

  function clearUnsavedChanges(): void {
    _hasUnsavedChanges = false
    cityssm.disableNavBlocker()
  }

  function hasUnsavedChanges(): boolean {
    return _hasUnsavedChanges
  }

  const Emile: EmileGlobal = {
    urlPrefix,
    setUnsavedChanges,
    clearUnsavedChanges,
    hasUnsavedChanges
  }

  // eslint-disable-next-line unicorn/prefer-module
  exports.Emile = Emile
})()
