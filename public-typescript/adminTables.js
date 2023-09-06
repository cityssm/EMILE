"use strict";
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b, _c;
    const Emile = exports.Emile;
    function refreshIconByElement(element) {
        const iconFieldElement = element.closest('.field');
        const iconClass = `${iconFieldElement.querySelector('select[name="fontAwesomeIconClass-style"]').value} fa-${iconFieldElement.querySelector('input[name="fontAwesomeIconClass-className').value}`;
        iconFieldElement.querySelector('.icon').innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
    }
    function refreshIconByStyleEvent(changeEvent) {
        const selectElement = changeEvent.currentTarget;
        selectElement.closest('.field').querySelector('input[name="fontAwesomeIconClass-className"]').setAttribute('list', `datalist--iconClasses-${selectElement.value}`);
        refreshIconByElement(selectElement);
    }
    function refreshIconByClassNameEvent(changeEvent) {
        refreshIconByElement(changeEvent.currentTarget);
    }
    // New Category Form
    let assetCategories = exports.assetCategories;
    function updateAssetCategory(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${Emile.urlPrefix}/admin/doUpdateAssetCategory`, formEvent.currentTarget, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                bulmaJS.alert({
                    message: 'Category updated successfully.',
                    contextualColorName: 'success'
                });
                assetCategories = responseJSON.assetCategories;
                renderAssetCategories();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Category',
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function moveAssetCategory(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const tableRowElement = buttonElement.closest('tr');
        const categoryId = tableRowElement === null || tableRowElement === void 0 ? void 0 : tableRowElement.dataset.categoryId;
        cityssm.postJSON(`${Emile.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveAssetCategoryUp'
            : 'doMoveAssetCategoryDown'}`, {
            categoryId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                assetCategories = responseJSON.assetCategories;
                renderAssetCategories();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Moving Category',
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function deleteAssetCategory(clickEvent) {
        var _a;
        const categoryId = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.categoryId;
        function doDelete() {
            cityssm.postJSON(`${Emile.urlPrefix}/admin/doDeleteAssetCategory`, {
                categoryId
            }, (rawResponseJSON) => {
                var _a;
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    bulmaJS.alert({
                        message: 'Category deleted successfully.',
                        contextualColorName: 'success'
                    });
                    assetCategories = responseJSON.assetCategories;
                    renderAssetCategories();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Category',
                        message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Asset Category',
            message: 'Are you sure you want to delete this category?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete Category',
                callbackFunction: doDelete
            }
        });
    }
    function renderAssetCategories() {
        var _a, _b, _c, _d;
        const tbodyElement = document.querySelector('#tbody--assetCategories');
        tbodyElement.innerHTML = '';
        for (const assetCategory of assetCategories) {
            const rowElement = document.createElement('tr');
            rowElement.dataset.categoryId = assetCategory.categoryId.toString();
            const fontAwesomeIconClasses = (_b = (_a = assetCategory.fontAwesomeIconClasses) === null || _a === void 0 ? void 0 : _a.split(' ')) !== null && _b !== void 0 ? _b : ['fas', 'fa-bolt'];
            const formId = `form--assetCategory-${assetCategory.categoryId}`;
            rowElement.innerHTML = `<td>
          <div class="field">
            <div class="control">
              <input class="input" name="category" form="${formId}" placeholder="Category Name" maxlength="100" required />
            </div>
          </div>
        </td>
        <td>
          <div class="field has-addons">
            <div class="control">
              <div class="select">
                <select name="fontAwesomeIconClass-style" form="${formId}" aria-label="Font Awesome Style" required>
                  <option value="fas">Solid</option>
                  <option value="far">Regular</option>
                </select>
              </div>
            </div>
            <div class="control is-expanded">
              <input class="input" name="fontAwesomeIconClass-className" form="${formId}" list="datalist--iconClasses-${fontAwesomeIconClasses[0]}" aria-label="Font Awesome Class Name" maxlength="43" required />
            </div>
            <div class="control">
              <span class="button is-static">
                <span class="icon"></span>
              </span>
            </div>
          </div>
        </td>
        <td class="has-width-10">
          <form id="${formId}">
            <input name="categoryId" type="hidden" value="${assetCategory.categoryId}" />
            <button class="button is-success" type="submit">
              <span class="icon"><i class="fas fa-save" aria-hidden="true"></i></span>
              <span>Update</span>
            </button>
          </form>
        </td>
        <td class="has-width-10">
          <div class="field has-addons">
            <div class="control">
              <button class="button is-move-button" data-direction="up" type="button" aria-label="Move Category Up">
              <span class="icon">
                <i class="fas fa-arrow-up" aria-hidden="true"></i>
              </span>
              </button>
            </div>
            <div class="control">
              <button class="button is-move-button" data-direction="down" type="button" aria-label="Move Category Down">
                <span class="icon">
                  <i class="fas fa-arrow-down" aria-hidden="true"></i>
                </span>
              </button>
            </div>
          </div>
        </td>
        <td class="has-width-10">
          <button class="button is-light is-danger is-delete-button" type="button" aria-label="Delete Category">
            <span class="icon">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </span>
          </button>
        </td>`;
            rowElement.querySelector('input[name="category"]').value = assetCategory.category;
            const styleSelectElement = rowElement.querySelector('select[name="fontAwesomeIconClass-style');
            styleSelectElement.value = fontAwesomeIconClasses[0];
            styleSelectElement.addEventListener('change', refreshIconByStyleEvent);
            const classNameElement = rowElement.querySelector('input[name="fontAwesomeIconClass-className"]');
            classNameElement.value = fontAwesomeIconClasses[1].slice(3);
            classNameElement.addEventListener('keyup', refreshIconByClassNameEvent);
            refreshIconByElement(classNameElement);
            (_c = rowElement
                .querySelector(`#${formId}`)) === null || _c === void 0 ? void 0 : _c.addEventListener('submit', updateAssetCategory);
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const moveButtonElements = rowElement.querySelectorAll('.is-move-button');
            for (const moveButtonElement of moveButtonElements) {
                moveButtonElement.addEventListener('click', moveAssetCategory);
            }
            (_d = rowElement
                .querySelector('.is-delete-button')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', deleteAssetCategory);
            tbodyElement.append(rowElement);
        }
    }
    (_a = document
        .querySelector('#assetCategoryAdd--fontAwesomeIconClass-style')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', refreshIconByStyleEvent);
    (_b = document
        .querySelector('#assetCategoryAdd--fontAwesomeIconClass-className')) === null || _b === void 0 ? void 0 : _b.addEventListener('keyup', refreshIconByClassNameEvent);
    refreshIconByElement(document.querySelector('#assetCategoryAdd--fontAwesomeIconClass-style'));
    (_c = document
        .querySelector('#form--assetCategoryAdd')) === null || _c === void 0 ? void 0 : _c.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        const formElement = formEvent.currentTarget;
        cityssm.postJSON(`${Emile.urlPrefix}/admin/doAddAssetCategory`, formEvent.currentTarget, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                assetCategories = (_a = responseJSON.assetCategories) !== null && _a !== void 0 ? _a : [];
                renderAssetCategories();
                formElement.reset();
            }
        });
    });
    renderAssetCategories();
})();
