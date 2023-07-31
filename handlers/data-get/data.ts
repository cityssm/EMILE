import type { Request, Response } from 'express'

import {
  getFailedEnergyDataFiles,
  getPendingEnergyDataFiles
} from '../../database/getEnergyDataFiles.js'

export function handler(request: Request, response: Response): void {
  const pendingFiles = getPendingEnergyDataFiles()
  const failedFiles = getFailedEnergyDataFiles()

  response.render('data', {
    headTitle: 'Data',
    pendingFiles,
    failedFiles
  })
}

export default handler
