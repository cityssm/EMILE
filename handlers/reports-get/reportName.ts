import fs from 'node:fs/promises'
import path from 'node:path'

import type { Request, Response } from 'express'
import papaparse from 'papaparse'

import {
  getReportData,
  type ReportParameters
} from '../../database/getReportData.js'
import {
  reportCacheFolder,
  reportsToCache
} from '../../helpers/functions.reports.js'
import { hasActiveSession } from '../../helpers/functions.session.js'

export async function handler(request: Request, response: Response): Promise<void> {
  const reportName: string = request.params.reportName

  let csv = ''

  if (reportsToCache.includes(reportName)) {
    try {
      csv = (await fs.readFile(
        path.join(reportCacheFolder, `${reportName}.csv`)
      )) as unknown as string
    } catch {
      // ignore
    }
  }

  if ((csv ?? '') === '') {
    const rows = getReportData(reportName, request.query as ReportParameters)

    if (rows === undefined) {
      response.status(404).json({
        success: false,
        message: 'Report Not Found'
      })

      return
    }

    csv = papaparse.unparse(rows)
  }

  const disposition = hasActiveSession(request) ? 'attachment' : 'inline'

  response.setHeader(
    'Content-Disposition',
    `${disposition}; filename=${reportName}-${Date.now().toString()}.csv`
  )

  response.setHeader('Content-Type', 'text/csv')

  response.send(csv)
}

export default handler
