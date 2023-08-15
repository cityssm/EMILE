import type { Request, Response } from 'express'

import { deleteEnergyDataFile } from '../../database/deleteEnergyDataFile.js'
import { getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js'

export function handler(request: Request, response: Response): void {
  const success = deleteEnergyDataFile(
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
