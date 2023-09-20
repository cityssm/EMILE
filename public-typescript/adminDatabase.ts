// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { DatabaseFile } from '../types/applicationTypes.js'

import type { Emile as EmileGlobal } from './globalTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const Emile = exports.Emile as EmileGlobal

  /*
   * Backup
   */

  let backupFiles = exports.backupFiles as DatabaseFile[]

  function deleteBackupFile(clickEvent: Event): void {
    const fileName =
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .fileName ?? ''

    function doDelete(): void {
      cityssm.postJSON(
        `${Emile.urlPrefix}/admin/doDeleteBackupFile`,
        { fileName },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            backupFiles: DatabaseFile[]
          }

          if (responseJSON.success) {
            backupFiles = responseJSON.backupFiles

            bulmaJS.alert({
              message: 'Database backup deleted up successfully.',
              contextualColorName: 'success'
            })

            renderBackupFiles()
          } else {
            bulmaJS.alert({
              title: 'Error Deleting Backup File',
              message: 'Please try again.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete Backup File',
      message: 'Are you sure you want to delete this backed up database file?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Backup File',
        callbackFunction: doDelete
      }
    })
  }

  function renderBackupFiles(): void {
    const backupContainerElement = document.querySelector(
      '#container--backupFiles'
    ) as HTMLElement

    if (backupFiles.length === 0) {
      backupContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
        <strong>There are no backup files in the application's backup folder.</strong><br />
        Note that your systems administrator may be backing up the database in another way.
        </p>
        </div>`

      return
    }

    backupContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead><tr>
        <th>Backup File Name</th>
        <th>Last Modified</th>
        <th class="has-text-right">File Size</th>
        <th class="has-width-10"><span class="is-sr-only">Options</span></td>
      </tr></thead>
      <tbody></tbody>
      </table>`

    for (const backupFile of backupFiles) {
      const rowElement = document.createElement('tr')
      rowElement.dataset.fileName = backupFile.fileName

      rowElement.innerHTML = `<td>${backupFile.fileName}</td>
        <td>${backupFile.lastModifiedTime}</td>
        <td class="has-text-right">${backupFile.sizeInMegabytes.toFixed(2)} MB</td>
        <td>
          <div class="field is-grouped">
            <div class="control">
              <a class="button is-link" href="${Emile.urlPrefix}/backups/${backupFile.fileName}" download>
                <span class="icon"><i class="fas fa-download" aria-hidden="true"></i></span>
                <span>Download</span>
              </a>
            </div>
            <div class="control">
              <button class="button is-light is-danger is-delete-button" aria-label="Delete Backup">
                <i class="fas fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </td>`

      rowElement
        .querySelector('.is-delete-button')
        ?.addEventListener('click', deleteBackupFile)

      backupContainerElement.querySelector('tbody')?.append(rowElement)
    }
  }

  function doBackup(): void {
    cityssm.postJSON(
      `${Emile.urlPrefix}/admin/doBackupDatabase`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          backupFiles: DatabaseFile[]
        }

        if (responseJSON.success) {
          backupFiles = responseJSON.backupFiles

          bulmaJS.alert({
            message: 'Database backed up successfully.',
            contextualColorName: 'success'
          })

          renderBackupFiles()
        } else {
          bulmaJS.alert({
            title: 'Error Backing Up Database',
            message: 'Please try again.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  document.querySelector('.is-backup-button')?.addEventListener('click', () => {
    bulmaJS.confirm({
      title: 'Backup Database',
      message: "Are you sure you want to backup the application's database?",
      contextualColorName: 'info',
      okButton: {
        text: 'Yes, Backup Database',
        callbackFunction: doBackup
      }
    })
  })

  /*
   * Cleanup
   */

  function doCleanup(): void {
    cityssm.postJSON(
      `${Emile.urlPrefix}/admin/doCleanupDatabase`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          deleteCount: number
        }

        if (responseJSON.success) {
          bulmaJS.alert({
            title: 'Database Cleaned Up Successfully.',
            message: `${responseJSON.deleteCount} record(s) permanently deleted.`,
            contextualColorName: 'success'
          })
        } else {
          bulmaJS.alert({
            title: 'Error Cleaning Up Database',
            message: 'Please try again.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  document
    .querySelector('.is-cleanup-button')
    ?.addEventListener('click', () => {
      bulmaJS.confirm({
        title: 'Cleanup Database',
        message: `<strong>Are you sure you want to cleanup the database?</strong><br />
        The cleanup process may speed up the application by purging previously deleted records.`,
        messageIsHtml: true,
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Cleanup Database',
          callbackFunction: doCleanup
        }
      })
    })

  /*
   * Initialize
   */

  renderBackupFiles()
})()
