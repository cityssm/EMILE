"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a;
    const Emile = exports.Emile;
    /*
     * Backup Tab
     */
    let backupFiles = exports.backupFiles;
    function deleteBackupFile(clickEvent) {
        var _a, _b;
        const fileName = (_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.fileName) !== null && _b !== void 0 ? _b : '';
        function doDelete() {
            cityssm.postJSON(`${Emile.urlPrefix}/admin/doDeleteBackupFile`, { fileName }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    backupFiles = responseJSON.backupFiles;
                    bulmaJS.alert({
                        message: 'Database backup deleted up successfully.',
                        contextualColorName: 'success'
                    });
                    renderBackupFiles();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Backup File',
                        message: 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Backup File',
            message: 'Are you sure you want to delete this backed up database file?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete Backup File',
                callbackFunction: doDelete
            }
        });
    }
    function renderBackupFiles() {
        var _a, _b;
        const backupContainerElement = document.querySelector('#container--backupFiles');
        if (backupFiles.length === 0) {
            backupContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
        <strong>There are no backup files in the application's backup folder.</strong><br />
        Note that your systems administrator may be backing up the database in another way.
        </p>
        </div>`;
            return;
        }
        backupContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead><tr>
        <th>File Name</th>
        <th>Last Modified</th>
        <th class="has-text-right">File Size</th>
        <th class="has-width-10"><span class="is-sr-only">Options</span></td>
      </tr></thead>
      <tbody></tbody>
      </table>`;
        for (const backupFile of backupFiles) {
            const rowElement = document.createElement('tr');
            rowElement.dataset.fileName = backupFile.fileName;
            rowElement.innerHTML = `<td>${backupFile.fileName}</td>
        <td>${backupFile.lastModifiedTime}</td>
        <td class="has-text-right">${backupFile.sizeInMegabytes} MB</td>
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
        </td>`;
            (_a = rowElement
                .querySelector('.is-delete-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', deleteBackupFile);
            (_b = backupContainerElement.querySelector('tbody')) === null || _b === void 0 ? void 0 : _b.append(rowElement);
        }
    }
    (_a = document.querySelector('.is-backup-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        function doBackup() {
            cityssm.postJSON(`${Emile.urlPrefix}/admin/doBackupDatabase`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    backupFiles = responseJSON.backupFiles;
                    bulmaJS.alert({
                        message: 'Database backed up successfully.',
                        contextualColorName: 'success'
                    });
                    renderBackupFiles();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Backing Up Database',
                        message: 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Backup Database',
            message: "Are you sure you want to backup the application's database?",
            contextualColorName: 'info',
            okButton: {
                text: 'Yes, Backup Database',
                callbackFunction: doBackup
            }
        });
    });
    /*
     * Cleanup Tab
     */
    /*
     * Initialize
     */
    bulmaJS.init();
    renderBackupFiles();
})();
