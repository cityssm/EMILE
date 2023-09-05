import type { Request, Response } from 'express'

import {
  getPendingEnergyDataFiles,
  getProcessedEnergyDataFiles
} from '../../database/getEnergyDataFiles.js'

export function handler(request: Request, response: Response): void {
  const pendingFiles = getPendingEnergyDataFiles()
  const processedFiles = getProcessedEnergyDataFiles('')

  response.json({
    success: true,
    pendingFiles,
    processedFiles
  })
}

export default handler
