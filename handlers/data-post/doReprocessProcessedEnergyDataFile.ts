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

  const success = await updateEnergyDataFileAsReadyToPending(
    request.body.fileId,
    request.session.user as EmileUser
  )

  const pendingFiles = await getPendingEnergyDataFiles()
  const processedFiles = await getProcessedEnergyDataFiles('')

  response.json({
    success,
    pendingFiles,
    processedFiles
  })
}

export default handler
