import type { Request, Response } from 'express'

import { getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js'
import { updateEnergyDataFileAsReadyToProcess } from '../../database/updateEnergyDataFile.js'

export function handler(request: Request, response: Response): void {
  const success = updateEnergyDataFileAsReadyToProcess(
    request.body.fileId,
    request.session.user as EmileUser
  )

  const pendingFiles = getPendingEnergyDataFiles()

  response.json({
    success,
    pendingFiles
  })
}

export default handler
