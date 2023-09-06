import { getJsDateFromExcel } from 'excel-date-to-js'

export function excelDateToDate(excelDate: number): Date {
  return getJsDateFromExcel(excelDate)
}

export function mdyToDate(mdyString: string): Date {
  const pieces = mdyString.split('/')

  return new Date(
    Number.parseInt(pieces[2], 10),
    Number.parseInt(pieces[0], 10) - 1,
    Number.parseInt(pieces[1], 10)
  )
}
