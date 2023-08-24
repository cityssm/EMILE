// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { EnergyDataFile } from '../types/recordTypes.js'

import type { Emile as EmileGlobal } from './globalTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const Emile = exports.Emile as EmileGlobal

  const parserClassesAndConfigurations =
    exports.parserClassesAndConfigurations as string[]

  /*
   * Pending Files
   */

  type PendingFilesResponseJSON =
    | {
        success: true
        pendingFiles: EnergyDataFile[]
        processedFiles?: EnergyDataFile[]
      }
    | {
        success: false
        errorMessage: string
      }

  let pendingFiles = exports.pendingFiles as EnergyDataFile[]
  delete exports.pendingFiles

  function updatePendingEnergyDataFile(formEvent: Event): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${Emile.urlPrefix}/data/doUpdatePendingEnergyDataFile`,
      formEvent.currentTarget,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as PendingFilesResponseJSON

        if (responseJSON.success) {
          bulmaJS.alert({
            message: 'File Updated Successfully',
            contextualColorName: 'success'
          })

          pendingFiles = responseJSON.pendingFiles ?? []
          renderPendingFiles()
        } else {
          bulmaJS.alert({
            title: 'Error Updating File',
            message: responseJSON.errorMessage ?? 'Please try again.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function openPendingDataFileSettings(clickEvent: Event): void {
    const fileId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
        .fileId ?? '',
      10
    )

    const pendingFile = pendingFiles.find((possibleFile) => {
      return possibleFile.fileId === fileId
    }) as EnergyDataFile

    cityssm.openHtmlModal('data-parserSettings', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#energyDataFileEdit--fileId'
          ) as HTMLInputElement
        ).value = pendingFile.fileId?.toString() ?? ''
        ;(
          modalElement.querySelector(
            '[data-field="originalFileName"]'
          ) as HTMLElement
        ).textContent = pendingFile.originalFileName

        if (pendingFile.assetId !== null) {
          ;(
            modalElement.querySelector(
              '#energyDataFileEdit--assetId'
            ) as HTMLInputElement
          ).value = pendingFile.assetId?.toString() ?? ''
          ;(
            modalElement.querySelector(
              '#energyDataFileEdit--assetSelector .icon'
            ) as HTMLElement
          ).innerHTML = `<i class="${
            pendingFile.fontAwesomeIconClasses ?? 'fas fa-bolt'
          }" aria-hidden="true"></i>`
          ;(
            modalElement.querySelector(
              '#energyDataFileEdit--assetSelector button'
            ) as HTMLElement
          ).textContent = pendingFile.assetName ?? ''
        }

        /*
         * Parser Class Dropdown
         */

        const parserClassSelectElement = modalElement.querySelector(
          '#energyDataFileEdit--parserClass'
        ) as HTMLSelectElement

        let parserClassFound = false

        const pendingFileParserClassAndConfiguration =
          (pendingFile.parserProperties?.parserClass ?? '') +
          (pendingFile.parserProperties?.parserConfig === undefined
            ? ''
            : '::' + pendingFile.parserProperties.parserConfig)

        for (const parserClassAndConfiguration of parserClassesAndConfigurations) {
          const optionElement = document.createElement('option')
          optionElement.value = parserClassAndConfiguration
          optionElement.textContent = parserClassAndConfiguration

          if (
            parserClassAndConfiguration ===
            pendingFileParserClassAndConfiguration
          ) {
            optionElement.selected = true
            parserClassFound = true
          }

          parserClassSelectElement.append(optionElement)
        }

        if (
          !parserClassFound &&
          pendingFile.parserProperties !== undefined &&
          pendingFile.parserProperties.parserClass !== undefined
        ) {
          const optionElement = document.createElement('option')
          optionElement.value = pendingFileParserClassAndConfiguration
          optionElement.textContent =
            pendingFileParserClassAndConfiguration + ' (Unavailable)'
          optionElement.selected = true
          parserClassSelectElement.append(optionElement)
        }
      },
      onshown(modalElement) {
        bulmaJS.toggleHtmlClipped()

        Emile.initializeAssetSelector({
          assetSelectorElement: modalElement.querySelector(
            '#energyDataFileEdit--assetSelector'
          ) as HTMLElement
        })

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', updatePendingEnergyDataFile)
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function confirmDeletePendingDataFile(clickEvent: Event): void {
    const fileId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
        .fileId ?? '',
      10
    )

    function doDelete(): void {
      cityssm.postJSON(
        `${Emile.urlPrefix}/data/doDeletePendingEnergyDataFile`,
        {
          fileId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as PendingFilesResponseJSON

          if (responseJSON.success) {
            bulmaJS.alert({
              message: 'File Deleted Successfully',
              contextualColorName: 'success'
            })

            pendingFiles = responseJSON.pendingFiles
            renderPendingFiles()
          } else {
            bulmaJS.alert({
              title: 'Error Deleting File',
              message: responseJSON.errorMessage ?? 'Please try again.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete File',
      message: 'Are you sure you want to delete this file?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete File',
        callbackFunction: doDelete
      }
    })
  }

  function confirmProcessPendingDataFile(clickEvent: Event): void {
    const fileId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
        .fileId ?? '',
      10
    )

    function doProcess(): void {
      cityssm.postJSON(
        `${Emile.urlPrefix}/data/doProcessPendingEnergyDataFile`,
        {
          fileId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as PendingFilesResponseJSON

          if (responseJSON.success) {
            bulmaJS.alert({
              title: 'File Marked for Processing Successfully',
              message:
                'Processing may take a few minutes depending on how many files are being processed.',
              contextualColorName: 'success'
            })

            pendingFiles = responseJSON.pendingFiles
            renderPendingFiles()
          } else {
            bulmaJS.alert({
              title: 'Error Updating File',
              message: responseJSON.errorMessage ?? 'Please try again.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Mark File Ready to Process',
      message: 'Are you sure you are ready for this file to be processed?',
      contextualColorName: 'info',
      okButton: {
        text: 'Yes, Process File',
        callbackFunction: doProcess
      }
    })
  }

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
      <th><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>`

    for (const pendingFile of pendingFiles) {
      const rowElement = document.createElement('tr')
      rowElement.dataset.fileId = pendingFile.fileId?.toString()

      const recordCreateDate = new Date(
        pendingFile.recordCreate_timeMillis as number
      )

      rowElement.innerHTML = `<td>
          <span class="has-text-weight-bold" data-field="originalFileName"></span><br />
          <span class="is-size-7">Uploaded ${recordCreateDate.toISOString()}</span>
        </td>
        <td class="is-size-7">
          <span>${
            pendingFile.assetId === null
              ? '<i class="fas fa-fw fa-hat-wizard" aria-hidden="true"></i> Detect Asset from File'
              : `<i class="fa-fw ${
                  pendingFile.fontAwesomeIconClasses ?? 'fas fa-bolt'
                }" aria-hidden="true"></i> <span data-field="assetName"></span>`
          }</span><br />
          <span>
            <i class="fas fa-fw fa-book-open" aria-hidden="true"></i>
            ${
              (pendingFile.parserProperties?.parserClass ?? '') === ''
                ? 'No Parser Selected'
                : pendingFile.parserProperties?.parserClass ?? ''
            }
          </span><br />
          ${
            (pendingFile.parserProperties?.parserConfig ?? '') === ''
              ? ''
              : `<span>
                <i class="fas fa-fw fa-cog" aria-hidden="true"></i>
                ${pendingFile.parserProperties?.parserConfig ?? ''}
              </span>`
          }
        </td>
        <td class="has-text-right">
          <button class="button is-info is-settings-button" type="button">
            <span class="icon"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
            <span>Settings</span>
          </button>
          <button class="button is-success is-parse-button" type="button" ${
            (pendingFile.parserProperties?.parserClass ?? '') === ''
              ? 'disabled'
              : ''
          }>
            <span class="icon"><i class="fas fa-cogs" aria-hidden="true"></i></span>
            <span>Parse File</span>
          </button>
          <button class="button is-danger is-light is-delete-button" type="button" aria-label="Delete File">
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

      rowElement
        .querySelector('.is-settings-button')
        ?.addEventListener('click', openPendingDataFileSettings)

      rowElement
        .querySelector('.is-parse-button')
        ?.addEventListener('click', confirmProcessPendingDataFile)

      rowElement
        .querySelector('.is-delete-button')
        ?.addEventListener('click', confirmDeletePendingDataFile)

      tableElement.querySelector('tbody')?.append(rowElement)
    }

    pendingFilesContainerElement.innerHTML = ''
    pendingFilesContainerElement.append(tableElement)
  }

  renderPendingFiles()

  /*
   * Processed Files
   */

  type ProcessedFilesResponseJSON =
    | {
        success: true
        processedFiles: EnergyDataFile[]
        pendingFiles?: EnergyDataFile[]
      }
    | {
        success: false
        errorMessage: string
      }

  let processedFiles = exports.processedFiles as EnergyDataFile[]
  delete exports.processedFiles

  function confirmReprocessProcessedDataFile(clickEvent: Event): void {
    const fileId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
        .fileId ?? '',
      10
    )

    function doReprocess(): void {
      cityssm.postJSON(
        `${Emile.urlPrefix}/data/doReprocessProcessedEnergyDataFile`,
        {
          fileId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ProcessedFilesResponseJSON

          if (responseJSON.success) {
            bulmaJS.alert({
              title: 'File Marked Moved to Pending List',
              message: `All data associated with the file has been deleted.
                  You can now change any necessary processing settings, and process the file again.`,
              contextualColorName: 'success'
            })

            pendingFiles = responseJSON.pendingFiles ?? []
            renderPendingFiles()

            processedFiles = responseJSON.processedFiles
            renderProcessedFiles()
          } else {
            bulmaJS.alert({
              title: 'Error Updating File',
              message: responseJSON.errorMessage ?? 'Please try again.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Mark File for Reprocessing',
      message: 'Are you sure you want to reprocess this file?',
      contextualColorName: 'info',
      okButton: {
        text: 'Yes, Reprocess File',
        callbackFunction: doReprocess
      }
    })
  }

  function confirmDeleteProcessedDataFile(clickEvent: Event): void {
    const fileId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
        .fileId ?? '',
      10
    )

    function doDelete(): void {
      cityssm.postJSON(
        `${Emile.urlPrefix}/data/doDeleteProcessedEnergyDataFile`,
        {
          fileId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ProcessedFilesResponseJSON

          if (responseJSON.success) {
            bulmaJS.alert({
              message: 'File Deleted Successfully',
              contextualColorName: 'success'
            })

            processedFiles = responseJSON.processedFiles
            renderProcessedFiles()
          } else {
            bulmaJS.alert({
              title: 'Error Deleting File',
              message: responseJSON.errorMessage ?? 'Please try again.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete File',
      message: 'Are you sure you want to delete this file?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete File',
        callbackFunction: doDelete
      }
    })
  }

  function renderProcessedFiles(): void {
    const containerElement = document.querySelector(
      '#container--processedFiles'
    ) as HTMLElement

    const tableElement = document.createElement('table')
    tableElement.className =
      'table is-fullwidth is-striped is-hoverable has-sticky-header'

    tableElement.innerHTML = `<thead><tr>
      <th class="has-width-10"><span class="is-sr-only">Processed Status</span></th>
      <th>Processed File</th>
      <th>Results</th>
      <th><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>`

    for (const dataFile of processedFiles) {
      const rowElement = document.createElement('tr')
      rowElement.dataset.fileId = dataFile.fileId?.toString()

      rowElement.innerHTML = `<td>
        ${
          dataFile.isFailed
            ? '<i class="fas fa-exclamation-circle has-text-danger" aria-hidden="true"></i>'
            : '<i class="fas fa-check-circle has-text-success" aria-hidden="true"></i>'
        }
        </td>
        <td><strong data-field="originalFileName"></strong></td>
        <td data-field="results"></td>
        <td class="has-text-right">
          ${
            dataFile.isFailed
              ? `<button class="button is-light is-danger is-delete-button" type="button">
                  <i class="fas fa-trash" aria-hidden="true"></i>
                  </button>`
              : `<a class="button" href="${Emile.urlPrefix}/reports/energyData-formatted-filtered?fileId=${dataFile.fileId}" type="download">
                  <span class="icon is-small"><i class="fas fa-file-csv" aria-hidden="true"></i></span>
                  <span>Export</span>
                </a>`
          }
          <button class="button is-warning is-reprocess-button" type="button">
            <span class="icon"><i class="fas fa-cogs" aria-hidden="true"></i></span>
            <span>Process Again</span>
          </button>
        </td>`
      ;(
        rowElement.querySelector(
          '[data-field="originalFileName"]'
        ) as HTMLElement
      ).textContent = dataFile.originalFileName
      ;(
        rowElement.querySelector('[data-field="results"]') as HTMLElement
      ).textContent = dataFile.isFailed
        ? dataFile.processedMessage ?? ''
        : `${dataFile.energyDataCount ?? 0} data points`

      rowElement
        .querySelector('.is-reprocess-button')
        ?.addEventListener('click', confirmReprocessProcessedDataFile)

      rowElement
        .querySelector('.is-delete-button')
        ?.addEventListener('click', confirmDeleteProcessedDataFile)

      tableElement.querySelector('tbody')?.append(rowElement)
    }

    if (processedFiles.length === 0) {
      containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no processed files to display.</p>
        </div>`
    } else {
      containerElement.innerHTML = ''
      containerElement.append(tableElement)
    }
  }

  renderProcessedFiles()

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

    if (dragEvent.dataTransfer?.items !== undefined) {
      // Use DataTransferItemList interface to access the file(s)
      for (const item of dragEvent.dataTransfer.items) {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const file = item.getAsFile() as File
          data.append('file', file)
        }
      }
    } else if (dragEvent.dataTransfer?.files !== undefined) {
      // Use DataTransfer interface to access the file(s)
      for (const file of dragEvent.dataTransfer.files) {
        data.append('file', file)
      }
    }

    fetch(`${Emile.urlPrefix}/data/doUploadDataFiles`, {
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
      .then((responseJSON: PendingFilesResponseJSON) => {
        if (responseJSON.success) {
          pendingFiles = responseJSON.pendingFiles
          renderPendingFiles()

          processedFiles = responseJSON.processedFiles ?? []
          renderProcessedFiles()
        }

        return responseJSON.success
      })
      .catch(() => {
        bulmaJS.alert({
          message: 'Error processing files.',
          contextualColorName: 'danger'
        })
      })

    uploadDropZoneElement.classList.remove(...dragOverClasses)
  })

  /*
   * Page Initialize
   */

  bulmaJS.init()
})()
