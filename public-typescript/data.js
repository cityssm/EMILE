"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */
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
    /*
     * Pending Files
     */
    let pendingFiles = exports.pendingFiles;
    delete exports.pendingFiles;
    function renderPendingFiles() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
      <th class="has-text-right">Options</th>
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
          <span data-field="assetName">${pendingFile.assetId === null
                ? '<i class="fas fa-fw fa-hat-wizard" aria-hidden="true"></i> Detect from File'
                : ''}</span><br />
          <span>
            <i class="fas fa-fw fa-cog" aria-hidden="true"></i>
            ${((_c = (_b = pendingFile.parserProperties) === null || _b === void 0 ? void 0 : _b.parserClass) !== null && _c !== void 0 ? _c : '') === ''
                ? 'No Parser Selected'
                : (_e = (_d = pendingFile.parserProperties) === null || _d === void 0 ? void 0 : _d.parserClass) !== null && _e !== void 0 ? _e : ''}
          </span>
        </td>
        <td class="has-text-right">
          <button class="button is-info" type="button">
            <span class="icon"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
            <span>Settings</span>
          </button>
          <button class="button is-success" type="button" ${((_g = (_f = pendingFile.parserProperties) === null || _f === void 0 ? void 0 : _f.parserClass) !== null && _g !== void 0 ? _g : '') === ''
                ? 'disabled'
                : ''}>
            <span class="icon"><i class="fas fa-cogs" aria-hidden="true"></i></span>
            <span>Parse File</span>
          </button>
          <button class="button is-danger is-light" type="button" aria-label="Delete File">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </td>`;
            if (pendingFile.assetId !== null) {
                ;
                rowElement.querySelector('[data-field="assetName"]').textContent = (_h = pendingFile.assetName) !== null && _h !== void 0 ? _h : '';
            }
            ;
            rowElement.querySelector('[data-field="originalFileName"]').textContent = pendingFile.originalFileName;
            (_j = tableElement.querySelector('tbody')) === null || _j === void 0 ? void 0 : _j.append(rowElement);
        }
        pendingFilesContainerElement.innerHTML = '';
        pendingFilesContainerElement.append(tableElement);
    }
    renderPendingFiles();
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
        let fileIndex = -1;
        if (((_a = dragEvent.dataTransfer) === null || _a === void 0 ? void 0 : _a.items) !== undefined) {
            // Use DataTransferItemList interface to access the file(s)
            for (const item of dragEvent.dataTransfer.items) {
                // If dropped items aren't files, reject them
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    fileIndex += 1;
                    data.append('file', file);
                }
            }
        }
        else if (((_b = dragEvent.dataTransfer) === null || _b === void 0 ? void 0 : _b.files) !== undefined) {
            // Use DataTransfer interface to access the file(s)
            for (const file of dragEvent.dataTransfer.files) {
                fileIndex += 1;
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
            console.log(responseJSON);
        })
            .catch(() => {
            bulmaJS.alert({
                message: 'Error processing files.',
                contextualColorName: 'danger'
            });
        });
        uploadDropZoneElement.classList.remove(...dragOverClasses);
    });
})();
