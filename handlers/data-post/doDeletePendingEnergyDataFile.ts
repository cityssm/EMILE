import type { Request, Response } from 'express'

import { deleteEnergyDataFile } from '../../database/deleteEnergyDataFile.js'
import { getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js'

export async function handler(request: Request, response: Response): Promise<void> {
  const success = await deleteEnergyDataFile(
    request.body.fileId,
    request.session.user as EmileUser
  )

  const pendingFiles = await getPendingEnergyDataFiles()

  response.json({
    success,
    pendingFiles
  })
}

export default handler
