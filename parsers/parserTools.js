import { getJsDateFromExcel } from 'excel-date-to-js';
export function excelDateToDate(excelDate) {
    return getJsDateFromExcel(excelDate);
}
