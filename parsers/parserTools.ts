import { getJsDateFromExcel } from 'excel-date-to-js'

export function excelDateToDate(excelDate: number): Date {
  return getJsDateFromExcel(excelDate)
}
