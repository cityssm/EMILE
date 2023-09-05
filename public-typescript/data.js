"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b, _c;
    const Emile = exports.Emile;
    const parserClassesAndConfigurations = exports.parserClassesAndConfigurations;
    let pendingFiles = exports.pendingFiles;
    delete exports.pendingFiles;
    function updatePendingEnergyDataFile(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${Emile.urlPrefix}/data/doUpdatePendingEnergyDataFile`, formEvent.currentTarget, (rawResponseJSON) => {
            var _a, _b;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                bulmaJS.alert({
                    message: 'File Updated Successfully',
                    contextualColorName: 'success'
                });
                pendingFiles = (_a = responseJSON.pendingFiles) !== null && _a !== void 0 ? _a : [];
                renderPendingFiles();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating File',
                    message: (_b = responseJSON.errorMessage) !== null && _b !== void 0 ? _b : 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function openPendingDataFileSettings(clickEvent) {
        var _a, _b;
        const fileId = Number.parseInt((_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.fileId) !== null && _b !== void 0 ? _b : '', 10);
        const pendingFile = pendingFiles.find((possibleFile) => {
            return possibleFile.fileId === fileId;
        });
        cityssm.openHtmlModal('data-parserSettings', {
            onshow(modalElement) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                ;
                modalElement.querySelector('#energyDataFileEdit--fileId').value = (_b = (_a = pendingFile.fileId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                modalElement.querySelector('[data-field="originalFileName"]').textContent = pendingFile.originalFileName;
                if (pendingFile.assetId !== null) {
                    ;
                    modalElement.querySelector('#energyDataFileEdit--assetId').value = (_d = (_c = pendingFile.assetId) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
                    modalElement.querySelector('#energyDataFileEdit--assetSelector .icon').innerHTML = `<i class="${(_e = pendingFile.fontAwesomeIconClasses) !== null && _e !== void 0 ? _e : 'fas fa-bolt'}" aria-hidden="true"></i>`;
                    modalElement.querySelector('#energyDataFileEdit--assetSelector button').textContent = (_f = pendingFile.assetName) !== null && _f !== void 0 ? _f : '';
                }
                /*
                 * Parser Class Dropdown
                 */
                const parserClassSelectElement = modalElement.querySelector('#energyDataFileEdit--parserClass');
                let parserClassFound = false;
                const pendingFileParserClassAndConfiguration = ((_h = (_g = pendingFile.parserProperties) === null || _g === void 0 ? void 0 : _g.parserClass) !== null && _h !== void 0 ? _h : '') +
                    (((_j = pendingFile.parserProperties) === null || _j === void 0 ? void 0 : _j.parserConfig) === undefined
                        ? ''
                        : `::${pendingFile.parserProperties.parserConfig}`);
                for (const parserClassAndConfiguration of parserClassesAndConfigurations) {
                    const optionElement = document.createElement('option');
                    optionElement.value = parserClassAndConfiguration;
                    optionElement.textContent = parserClassAndConfiguration;
                    if (parserClassAndConfiguration ===
                        pendingFileParserClassAndConfiguration) {
                        optionElement.selected = true;
                        parserClassFound = true;
                    }
                    parserClassSelectElement.append(optionElement);
                }
                if (!parserClassFound &&
                    pendingFile.parserProperties !== undefined &&
                    pendingFile.parserProperties.parserClass !== undefined) {
                    const optionElement = document.createElement('option');
                    optionElement.value = pendingFileParserClassAndConfiguration;
                    optionElement.textContent = `${pendingFileParserClassAndConfiguration} (Unavailable)`;
                    optionElement.selected = true;
                    parserClassSelectElement.append(optionElement);
                }
            },
            onshown(modalElement) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                Emile.initializeAssetSelector({
                    assetSelectorElement: modalElement.querySelector('#energyDataFileEdit--assetSelector')
                });
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', updatePendingEnergyDataFile);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function confirmDeletePendingDataFile(clickEvent) {
        var _a, _b;
        const fileId = Number.parseInt((_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.fileId) !== null && _b !== void 0 ? _b : '', 10);
        function doDelete() {
            cityssm.postJSON(`${Emile.urlPrefix}/data/doDeletePendingEnergyDataFile`, {
                fileId
            }, (rawResponseJSON) => {
                var _a;
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    bulmaJS.alert({
                        message: 'File Deleted Successfully',
                        contextualColorName: 'success'
                    });
                    pendingFiles = responseJSON.pendingFiles;
                    renderPendingFiles();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting File',
                        message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete File',
            message: 'Are you sure you want to delete this file?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete File',
                callbackFunction: doDelete
            }
        });
    }
    function confirmProcessPendingDataFile(clickEvent) {
        var _a, _b;
        const fileId = Number.parseInt((_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.fileId) !== null && _b !== void 0 ? _b : '', 10);
        function doProcess() {
            cityssm.postJSON(`${Emile.urlPrefix}/data/doProcessPendingEnergyDataFile`, {
                fileId
            }, (rawResponseJSON) => {
                var _a;
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    bulmaJS.alert({
                        title: 'File Marked for Processing Successfully',
                        message: 'Processing may take a few minutes depending on how many files are being processed.',
                        contextualColorName: 'success'
                    });
                    pendingFiles = responseJSON.pendingFiles;
                    renderPendingFiles();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Updating File',
                        message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Mark File Ready to Process',
            message: 'Are you sure you are ready for this file to be processed?',
            contextualColorName: 'info',
            okButton: {
                text: 'Yes, Process File',
                callbackFunction: doProcess
            }
        });
    }
    function renderPendingFiles() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const pendingFilesCountElement = document.querySelector('#count--pendingFiles');
        const pendingFilesContainerElement = document.querySelector('#container--pendingFiles');
        pendingFilesCountElement.textContent = pendingFiles.length.toString();
        if (pendingFiles.length === 0) {
            pendingFilesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no pending files that require attention.</p>
        </div>`;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable has-sticky-header';
        tableElement.innerHTML = `<thead><tr>
      <th>Pending File</th>
      <th>Parser Settings</th>
      <th><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>`;
        for (const pendingFile of pendingFiles) {
            const rowElement = document.createElement('tr');
            rowElement.dataset.fileId = (_a = pendingFile.fileId) === null || _a === void 0 ? void 0 : _a.toString();
            const recordCreateDate = new Date(pendingFile.recordCreate_timeMillis);
            rowElement.innerHTML = `<td>
          <span class="has-text-weight-bold" data-field="originalFileName"></span><br />
          <span class="is-size-7">Uploaded ${recordCreateDate.toISOString()}</span>
        </td>
        <td class="is-size-7">
          <span>${pendingFile.assetId === null
                ? '<i class="fas fa-fw fa-hat-wizard" aria-hidden="true"></i> Detect Asset from File'
                : `<i class="fa-fw ${(_b = pendingFile.fontAwesomeIconClasses) !== null && _b !== void 0 ? _b : 'fas fa-bolt'}" aria-hidden="true"></i> <span data-field="assetName"></span>`}</span><br />
          <span>
            <i class="fas fa-fw fa-book-open" aria-hidden="true"></i>
            ${((_d = (_c = pendingFile.parserProperties) === null || _c === void 0 ? void 0 : _c.parserClass) !== null && _d !== void 0 ? _d : '') === ''
                ? 'No Parser Selected'
                : (_f = (_e = pendingFile.parserProperties) === null || _e === void 0 ? void 0 : _e.parserClass) !== null && _f !== void 0 ? _f : ''}
          </span><br />
          ${((_h = (_g = pendingFile.parserProperties) === null || _g === void 0 ? void 0 : _g.parserConfig) !== null && _h !== void 0 ? _h : '') === ''
                ? ''
                : `<span>
                <i class="fas fa-fw fa-cog" aria-hidden="true"></i>
                ${(_k = (_j = pendingFile.parserProperties) === null || _j === void 0 ? void 0 : _j.parserConfig) !== null && _k !== void 0 ? _k : ''}
              </span>`}
        </td>
        <td class="has-text-right">
          <button class="button is-info is-settings-button" type="button">
            <span class="icon"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
            <span>Settings</span>
          </button>
          <button class="button is-success is-parse-button" type="button" ${((_m = (_l = pendingFile.parserProperties) === null || _l === void 0 ? void 0 : _l.parserClass) !== null && _m !== void 0 ? _m : '') === ''
                ? 'disabled'
                : ''}>
            <span class="icon"><i class="fas fa-cogs" aria-hidden="true"></i></span>
            <span>Parse File</span>
          </button>
          <button class="button is-danger is-light is-delete-button" type="button" aria-label="Delete File">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </td>`;
            if (pendingFile.assetId !== null) {
                ;
                rowElement.querySelector('[data-field="assetName"]').textContent = (_o = pendingFile.assetName) !== null && _o !== void 0 ? _o : '';
            }
            ;
            rowElement.querySelector('[data-field="originalFileName"]').textContent = pendingFile.originalFileName;
            (_p = rowElement
                .querySelector('.is-settings-button')) === null || _p === void 0 ? void 0 : _p.addEventListener('click', openPendingDataFileSettings);
            (_q = rowElement
                .querySelector('.is-parse-button')) === null || _q === void 0 ? void 0 : _q.addEventListener('click', confirmProcessPendingDataFile);
            (_r = rowElement
                .querySelector('.is-delete-button')) === null || _r === void 0 ? void 0 : _r.addEventListener('click', confirmDeletePendingDataFile);
            (_s = tableElement.querySelector('tbody')) === null || _s === void 0 ? void 0 : _s.append(rowElement);
        }
        pendingFilesContainerElement.innerHTML = '';
        pendingFilesContainerElement.append(tableElement);
    }
    (_a = document
        .querySelector('.is-refresh-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        cityssm.postJSON(`${Emile.urlPrefix}/data/doGetPendingFiles`, {}, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                pendingFiles = responseJSON.pendingFiles;
                renderPendingFiles();
                processedFiles = (_a = responseJSON.processedFiles) !== null && _a !== void 0 ? _a : [];
                renderProcessedFiles();
            }
        });
    });
    renderPendingFiles();
    let processedFiles = exports.processedFiles;
    delete exports.processedFiles;
    function confirmReprocessProcessedDataFile(clickEvent) {
        var _a, _b;
        const fileId = Number.parseInt((_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.fileId) !== null && _b !== void 0 ? _b : '', 10);
        function doReprocess() {
            cityssm.postJSON(`${Emile.urlPrefix}/data/doReprocessProcessedEnergyDataFile`, {
                fileId
            }, (rawResponseJSON) => {
                var _a, _b;
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    bulmaJS.alert({
                        title: 'File Marked Moved to Pending List',
                        message: `All data associated with the file has been deleted.
                  You can now change any necessary processing settings, and process the file again.`,
                        contextualColorName: 'success'
                    });
                    pendingFiles = (_a = responseJSON.pendingFiles) !== null && _a !== void 0 ? _a : [];
                    renderPendingFiles();
                    processedFiles = responseJSON.processedFiles;
                    renderProcessedFiles();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Updating File',
                        message: (_b = responseJSON.errorMessage) !== null && _b !== void 0 ? _b : 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Mark File for Reprocessing',
            message: 'Are you sure you want to reprocess this file?',
            contextualColorName: 'info',
            okButton: {
                text: 'Yes, Reprocess File',
                callbackFunction: doReprocess
            }
        });
    }
    function confirmDeleteProcessedDataFile(clickEvent) {
        var _a, _b;
        const fileId = Number.parseInt((_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.fileId) !== null && _b !== void 0 ? _b : '', 10);
        function doDelete() {
            cityssm.postJSON(`${Emile.urlPrefix}/data/doDeleteProcessedEnergyDataFile`, {
                fileId
            }, (rawResponseJSON) => {
                var _a;
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    bulmaJS.alert({
                        message: 'File Deleted Successfully',
                        contextualColorName: 'success'
                    });
                    processedFiles = responseJSON.processedFiles;
                    renderProcessedFiles();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting File',
                        message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete File',
            message: 'Are you sure you want to delete this file?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete File',
                callbackFunction: doDelete
            }
        });
    }
    function renderProcessedFiles() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const containerElement = document.querySelector('#container--processedFiles');
        const tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable has-sticky-header';
        tableElement.innerHTML = `<thead><tr>
      <th class="has-width-10"><span class="is-sr-only">Processed Status</span></th>
      <th>Processed File</th>
      <th>From</th>
      <th>To</th>
      <th class="has-text-right">Data Points</th>
      <th class="has-text-right">Assets</th>
      <th><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>`;
        for (const dataFile of processedFiles) {
            const rowElement = document.createElement('tr');
            rowElement.dataset.fileId = (_a = dataFile.fileId) === null || _a === void 0 ? void 0 : _a.toString();
            rowElement.innerHTML = `<td>
        ${dataFile.isFailed
                ? '<i class="fas fa-exclamation-circle has-text-danger" aria-hidden="true"></i>'
                : '<i class="fas fa-check-circle has-text-success" aria-hidden="true"></i>'}
        </td>
        <td><strong data-field="originalFileName"></strong></td>
        ${dataFile.isFailed
                ? '<td data-field="processedMessage" colspan="4"></td>'
                : `<td>${new Date(((_b = dataFile.timeSecondsMin) !== null && _b !== void 0 ? _b : 0) * 1000).toLocaleString()}</td>
              <td>${new Date(((_c = dataFile.endTimeSecondsMax) !== null && _c !== void 0 ? _c : 0) * 1000).toLocaleString()}</td>
              <td class="has-text-right">
                ${(_d = dataFile.energyDataCount) !== null && _d !== void 0 ? _d : 0}
              </td>
              <td class="has-text-right">
                ${(_e = dataFile.assetIdCount) !== null && _e !== void 0 ? _e : 0}
              </td>`}
        
        <td class="has-text-right">
          ${dataFile.isFailed
                ? `<button class="button is-light is-danger is-delete-button" type="button">
                  <i class="fas fa-trash" aria-hidden="true"></i>
                  </button>`
                : `<a class="button" href="${Emile.urlPrefix}/reports/energyData-formatted-filtered?fileId=${dataFile.fileId}" type="download">
                  <span class="icon is-small"><i class="fas fa-file-csv" aria-hidden="true"></i></span>
                  <span>Export</span>
                </a>`}
          <button class="button is-warning is-reprocess-button" type="button">
            <span class="icon"><i class="fas fa-cogs" aria-hidden="true"></i></span>
            <span>Process Again</span>
          </button>
        </td>`;
            rowElement.querySelector('[data-field="originalFileName"]').textContent = dataFile.originalFileName;
            if (dataFile.isFailed) {
                ;
                rowElement.querySelector('[data-field="processedMessage"]').textContent = (_f = dataFile.processedMessage) !== null && _f !== void 0 ? _f : '';
            }
            (_g = rowElement
                .querySelector('.is-reprocess-button')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', confirmReprocessProcessedDataFile);
            (_h = rowElement
                .querySelector('.is-delete-button')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', confirmDeleteProcessedDataFile);
            (_j = tableElement.querySelector('tbody')) === null || _j === void 0 ? void 0 : _j.append(rowElement);
        }
        if (processedFiles.length === 0) {
            containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no processed files to display.</p>
        </div>`;
        }
        else {
            containerElement.innerHTML = '';
            containerElement.append(tableElement);
        }
    }
    renderProcessedFiles();
    /*
     * Upload Handling
     */
    const csrfToken = (_c = (_b = document
        .querySelector("meta[name='csrf-token']")) === null || _b === void 0 ? void 0 : _b.getAttribute('content')) !== null && _c !== void 0 ? _c : '';
    const uploadDropZoneElement = document.querySelector('#upload--dropZone');
    const dragOverClasses = ['has-background-success-light', 'has-text-success'];
    uploadDropZoneElement.addEventListener('dragover', (dragEvent) => {
        dragEvent.preventDefault();
        uploadDropZoneElement.classList.add(...dragOverClasses);
    });
    uploadDropZoneElement.addEventListener('dragleave', (dragEvent) => {
        dragEvent.preventDefault();
        uploadDropZoneElement.classList.remove(...dragOverClasses);
    });
    uploadDropZoneElement.addEventListener('drop', (dragEvent) => {
        var _a, _b;
        dragEvent.preventDefault();
        const data = new FormData();
        if (((_a = dragEvent.dataTransfer) === null || _a === void 0 ? void 0 : _a.items) !== undefined) {
            // Use DataTransferItemList interface to access the file(s)
            for (const item of dragEvent.dataTransfer.items) {
                // If dropped items aren't files, reject them
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    data.append('file', file);
                }
            }
        }
        else if (((_b = dragEvent.dataTransfer) === null || _b === void 0 ? void 0 : _b.files) !== undefined) {
            // Use DataTransfer interface to access the file(s)
            for (const file of dragEvent.dataTransfer.files) {
                data.append('file', file);
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
            .then((response) => __awaiter(void 0, void 0, void 0, function* () {
            return yield response.json();
        }))
            .then((responseJSON) => {
            var _a;
            if (responseJSON.success) {
                pendingFiles = responseJSON.pendingFiles;
                renderPendingFiles();
                processedFiles = (_a = responseJSON.processedFiles) !== null && _a !== void 0 ? _a : [];
                renderProcessedFiles();
                document.querySelector('#container--pendingFiles').insertAdjacentHTML('afterbegin', `<div class="message is-info">
                <p class="message-body">
                  <strong>Refresh the list below to see the newly uploaded files.</strong><br />
                  If the files don't appear in the list, switch to the Processed Files tab to check for errors.
                </p>
              </div>`);
            }
            return responseJSON.success;
        })
            .catch(() => {
            bulmaJS.alert({
                message: 'Error processing files.',
                contextualColorName: 'danger'
            });
        });
        uploadDropZoneElement.classList.remove(...dragOverClasses);
    });
    /*
     * Page Initialize
     */
    bulmaJS.init();
})();
