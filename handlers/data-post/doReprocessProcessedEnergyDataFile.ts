import type { Request, Response } from 'express'

import { deleteEnergyDataByFileId } from '../../database/deleteEnergyData.js'
import {
  getPendingEnergyDataFiles,
  getProcessedEnergyDataFiles
} from '../../database/getEnergyDataFiles.js'
import { updateEnergyDataFileAsReadyToPending } from '../../database/updateEnergyDataFile.js'

export async function handler(request: Request, response: Response): Promise<void> {
  await deleteEnergyDataByFileId(
    request.body.fileId,
    request.session.user as EmileUser
  )

  const success = updateEnergyDataFileAsReadyToPending(
    request.body.fileId,
    request.session.user as EmileUser
  )

  const pendingFiles = getPendingEnergyDataFiles()
  const processedFiles = getProcessedEnergyDataFiles('')

  response.json({
    success,
    pendingFiles,
    processedFiles
  })
}

export default handler
