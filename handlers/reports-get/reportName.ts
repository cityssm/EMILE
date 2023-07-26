import type { Request, Response } from 'express'
import papaparse from 'papaparse'

import {
  getReportData,
  type ReportParameters
} from '../../database/getReportData.js'

export function handler(request: Request, response: Response): void {
  const reportName: string = request.params.reportName

  const rows = getReportData(reportName, request.query as ReportParameters)

  if (rows === undefined) {
    response.status(404).json({
      success: false,
      message: 'Report Not Found'
    })

    return
  }

  const csv = papaparse.unparse(rows)

  response.setHeader(
    'Content-Disposition',
    `attachment; filename=${reportName}-${Date.now().toString()}.csv`
  )

  response.setHeader('Content-Type', 'text/csv')

  response.send(csv)
}

export default handler
