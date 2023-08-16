import type { Request, Response } from 'express'

import { deleteEnergyDataFile } from '../../database/deleteEnergyDataFile.js'
import { getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js'

export function handler(request: Request, response: Response): void {
  const success = deleteEnergyDataFile(
    request.body.fileId,
    request.session.user as EmileUser
  )

  const processedFiles = getProcessedEnergyDataFiles('')

  response.json({
    success,
    processedFiles
  })
}

export default handler
