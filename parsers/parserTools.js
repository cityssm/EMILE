import { getJsDateFromExcel } from 'excel-date-to-js';
export function excelDateToDate(excelDate) {
    return getJsDateFromExcel(excelDate);
}
export function mdyToDate(mdyString) {
    const pieces = mdyString.split('/');
    return new Date(Number.parseInt(pieces[2], 10), Number.parseInt(pieces[0], 10) - 1, Number.parseInt(pieces[1], 10));
}
