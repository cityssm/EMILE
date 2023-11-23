import type { Request, Response } from 'express'

import { deleteEnergyDataFile } from '../../database/deleteEnergyDataFile.js'
import { getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js'

export async function handler(request: Request, response: Response): Promise<void> {
  const success = await deleteEnergyDataFile(
    request.body.fileId,
    request.session.user as EmileUser
  )

  const processedFiles = await getProcessedEnergyDataFiles('')

  response.json({
    success,
    processedFiles
  })
}

export default handler
