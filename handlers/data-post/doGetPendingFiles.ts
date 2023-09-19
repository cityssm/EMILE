import type { Request, Response } from 'express'

import {
  getPendingEnergyDataFiles,
  getProcessedEnergyDataFiles
} from '../../database/getEnergyDataFiles.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const pendingFiles = await getPendingEnergyDataFiles()
  const processedFiles = await getProcessedEnergyDataFiles('')

  response.json({
    success: true,
    pendingFiles,
    processedFiles
  })
}

export default handler
