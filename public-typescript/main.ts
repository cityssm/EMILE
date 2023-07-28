import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Emile as EmileGlobal } from '../types/globalTypes.js'

declare const cityssm: cityssmGlobal
;(() => {
  const mainElement = document.querySelector('main') as HTMLElement

  const urlPrefix = mainElement.dataset.urlPrefix ?? ''
  const canUpdate = mainElement.dataset.canUpdate === 'true'

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

  /*
   * Map Link
   */

  function getMapLink(latitude: number, longitude: number): string {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  }

  /*
   * Build Global
   */

  const Emile: EmileGlobal = {
    urlPrefix,
    canUpdate,

    getMapLink,

    setUnsavedChanges,
    clearUnsavedChanges,
    hasUnsavedChanges
  }

  // eslint-disable-next-line unicorn/prefer-module
  exports.Emile = Emile
})()
