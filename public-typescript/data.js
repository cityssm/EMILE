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
    var _a, _b;
    const Emile = exports.Emile;
    const parserClasses = exports.parserClasses;
    let pendingFiles = exports.pendingFiles;
    delete exports.pendingFiles;
    function updatePendingEnergyDataFile(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(Emile.urlPrefix + '/data/doUpdatePendingEnergyDataFile', formEvent.currentTarget, (rawResponseJSON) => {
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
                var _a, _b, _c, _d, _e, _f, _g;
                ;
                modalElement.querySelector('#energyDataFileEdit--fileId').value = (_b = (_a = pendingFile.fileId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                modalElement.querySelector('[data-field="originalFileName"]').textContent = pendingFile.originalFileName;
                if (pendingFile.assetId !== null) {
                    ;
                    modalElement.querySelector('#energyDataFileEdit--assetId').value = (_d = (_c = pendingFile.assetId) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
                    modalElement.querySelector('#energyDataFileEdit--assetSelector .icon').innerHTML = `<i class="${(_e = pendingFile.fontAwesomeIconClasses) !== null && _e !== void 0 ? _e : 'fas fa-bolt'}" aria-hidden="true"></i>`;
                    modalElement.querySelector('#energyDataFileEdit--assetSelector button').textContent = (_f = pendingFile.assetName) !== null && _f !== void 0 ? _f : '';
                }
                const parserClassSelectElement = modalElement.querySelector('#energyDataFileEdit--parserClass');
                let parserClassFound = false;
                for (const parserClass of parserClasses) {
                    const optionElement = document.createElement('option');
                    optionElement.value = parserClass;
                    optionElement.textContent = parserClass;
                    if (parserClass === ((_g = pendingFile.parserProperties) === null || _g === void 0 ? void 0 : _g.parserClass)) {
                        optionElement.selected = true;
                        parserClassFound = true;
                    }
                    parserClassSelectElement.append(optionElement);
                }
                if (!parserClassFound &&
                    pendingFile.parserProperties !== undefined &&
                    pendingFile.parserProperties.parserClass !== undefined) {
                    const optionElement = document.createElement('option');
                    optionElement.value = pendingFile.parserProperties.parserClass;
                    optionElement.textContent = pendingFile.parserProperties.parserClass;
                    optionElement.selected = true;
                    parserClassSelectElement.append(optionElement);
                }
            },
            onshown(modalElement, closeModalFunction) {
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
            cityssm.postJSON(Emile.urlPrefix + '/data/doDeletePendingEnergyDataFile', {
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
            cityssm.postJSON(Emile.urlPrefix + '/data/doProcessPendingEnergyDataFile', {
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
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
            <i class="fas fa-fw fa-cog" aria-hidden="true"></i>
            ${((_d = (_c = pendingFile.parserProperties) === null || _c === void 0 ? void 0 : _c.parserClass) !== null && _d !== void 0 ? _d : '') === ''
                ? 'No Parser Selected'
                : (_f = (_e = pendingFile.parserProperties) === null || _e === void 0 ? void 0 : _e.parserClass) !== null && _f !== void 0 ? _f : ''}
          </span>
        </td>
        <td class="has-text-right">
          <button class="button is-info is-settings-button" type="button">
            <span class="icon"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
            <span>Settings</span>
          </button>
          <button class="button is-success is-parse-button" type="button" ${((_h = (_g = pendingFile.parserProperties) === null || _g === void 0 ? void 0 : _g.parserClass) !== null && _h !== void 0 ? _h : '') === ''
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
                rowElement.querySelector('[data-field="assetName"]').textContent = (_j = pendingFile.assetName) !== null && _j !== void 0 ? _j : '';
            }
            ;
            rowElement.querySelector('[data-field="originalFileName"]').textContent = pendingFile.originalFileName;
            (_k = rowElement
                .querySelector('.is-settings-button')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', openPendingDataFileSettings);
            (_l = rowElement
                .querySelector('.is-parse-button')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', confirmProcessPendingDataFile);
            (_m = rowElement
                .querySelector('.is-delete-button')) === null || _m === void 0 ? void 0 : _m.addEventListener('click', confirmDeletePendingDataFile);
            (_o = tableElement.querySelector('tbody')) === null || _o === void 0 ? void 0 : _o.append(rowElement);
        }
        pendingFilesContainerElement.innerHTML = '';
        pendingFilesContainerElement.append(tableElement);
    }
    renderPendingFiles();
    /*
     * Failed Files
     */
    let failedFiles = exports.failedFiles;
    delete exports.failedFiles;
    /*
     * Upload Handling
     */
    const csrfToken = (_b = (_a = document
        .querySelector("meta[name='csrf-token']")) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) !== null && _b !== void 0 ? _b : '';
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
        fetch(Emile.urlPrefix + '/data/doUploadDataFiles', {
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
            if (responseJSON.success) {
                pendingFiles = responseJSON.pendingFiles;
                renderPendingFiles();
                failedFiles = responseJSON.failedFiles;
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
