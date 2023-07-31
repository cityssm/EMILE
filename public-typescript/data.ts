// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Emile as EmileGlobal } from '../types/globalTypes.js'
import type { EnergyDataFile } from '../types/recordTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const Emile = exports.Emile as EmileGlobal

  /*
   * Pending Files
   */

  let pendingFiles = exports.pendingFiles as EnergyDataFile[]
  delete exports.pendingFiles

  function renderPendingFiles(): void {
    const pendingFilesCountElement = document.querySelector(
      '#count--pendingFiles'
    ) as HTMLElement

    const pendingFilesContainerElement = document.querySelector(
      '#container--pendingFiles'
    ) as HTMLElement

    pendingFilesCountElement.textContent = pendingFiles.length.toString()

    if (pendingFiles.length === 0) {
      pendingFilesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no pending files that require attention.</p>
        </div>`

      return
    }

    const tableElement = document.createElement('table')
    tableElement.className =
      'table is-fullwidth is-striped is-hoverable has-sticky-header'

    tableElement.innerHTML = `<thead><tr>
      <th>Pending File</th>
      <th>Parser Settings</th>
      <th class="has-text-right">Options</th>
      </tr></thead>
      <tbody></tbody>`

    for (const pendingFile of pendingFiles) {
      const rowElement = document.createElement('tr')
      rowElement.dataset.fileId = pendingFile.fileId?.toString()

      const recordCreateDate = new Date(pendingFile.recordCreate_timeMillis as number)

      rowElement.innerHTML = `<td>
          <span class="has-text-weight-bold" data-field="originalFileName"></span><br />
          <span class="is-size-7">Uploaded ${recordCreateDate.toISOString()}</span>
        </td>
        <td class="is-size-7">
          <span data-field="assetName">${
            pendingFile.assetId === null
              ? '<i class="fas fa-fw fa-hat-wizard" aria-hidden="true"></i> Detect from File'
              : ''
          }</span><br />
          <span>
            <i class="fas fa-fw fa-cog" aria-hidden="true"></i>
            ${
              (pendingFile.parserProperties?.parserClass ?? '') === ''
                ? 'No Parser Selected'
                : pendingFile.parserProperties?.parserClass ?? ''
            }
          </span>
        </td>
        <td class="has-text-right">
          <button class="button is-info" type="button">
            <span class="icon"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
            <span>Settings</span>
          </button>
          <button class="button is-success" type="button" ${
            (pendingFile.parserProperties?.parserClass ?? '') === ''
              ? 'disabled'
              : ''
          }>
            <span class="icon"><i class="fas fa-cogs" aria-hidden="true"></i></span>
            <span>Parse File</span>
          </button>
          <button class="button is-danger is-light" type="button" aria-label="Delete File">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </td>`

      if (pendingFile.assetId !== null) {
        ;(
          rowElement.querySelector('[data-field="assetName"]') as HTMLElement
        ).textContent = pendingFile.assetName ?? ''
      }

      ;(
        rowElement.querySelector(
          '[data-field="originalFileName"]'
        ) as HTMLElement
      ).textContent = pendingFile.originalFileName

      tableElement.querySelector('tbody')?.append(rowElement)
    }

    pendingFilesContainerElement.innerHTML = ''
    pendingFilesContainerElement.append(tableElement)
  }

  renderPendingFiles()

  /*
   * Upload Handling
   */

  const csrfToken =
    document
      .querySelector("meta[name='csrf-token']")
      ?.getAttribute('content') ?? ''

  const uploadDropZoneElement = document.querySelector(
    '#upload--dropZone'
  ) as HTMLElement

  const dragOverClasses = ['has-background-success-light', 'has-text-success']

  uploadDropZoneElement.addEventListener('dragover', (dragEvent) => {
    dragEvent.preventDefault()
    uploadDropZoneElement.classList.add(...dragOverClasses)
  })

  uploadDropZoneElement.addEventListener('dragleave', (dragEvent) => {
    dragEvent.preventDefault()
    uploadDropZoneElement.classList.remove(...dragOverClasses)
  })

  uploadDropZoneElement.addEventListener('drop', (dragEvent) => {
    dragEvent.preventDefault()

    const data = new FormData()
    let fileIndex = -1

    if (dragEvent.dataTransfer?.items !== undefined) {
      // Use DataTransferItemList interface to access the file(s)
      for (const item of dragEvent.dataTransfer.items) {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const file = item.getAsFile() as File
          fileIndex += 1
          data.append('file', file)
        }
      }
    } else if (dragEvent.dataTransfer?.files !== undefined) {
      // Use DataTransfer interface to access the file(s)
      for (const file of dragEvent.dataTransfer.files) {
        fileIndex += 1
        data.append('file', file)
      }
    }

    fetch(Emile.urlPrefix + '/data/doUploadDataFiles', {
      credentials: 'same-origin',
      headers: {
        'CSRF-Token': csrfToken
      },
      method: 'POST',
      body: data
    })
      .then(async (response) => {
        return await response.json()
      })
      .then((responseJSON) => {
        console.log(responseJSON)
      })
      .catch(() => {
        bulmaJS.alert({
          message: 'Error processing files.',
          contextualColorName: 'danger'
        })
      })

    uploadDropZoneElement.classList.remove(...dragOverClasses)
  })
})()
