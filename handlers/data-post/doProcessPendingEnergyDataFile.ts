import type { Request, Response } from 'express'

import { getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js'
import { updateEnergyDataFileAsReadyToProcess } from '../../database/updateEnergyDataFile.js'
import type { RunFileProcessorWorkerMessage } from '../../types/applicationTypes.js'

export async function handler(request: Request, response: Response): Promise<void> {
  const success = updateEnergyDataFileAsReadyToProcess(
    request.body.fileId,
    request.session.user as EmileUser
  )

  if (process.send !== undefined) {
    process.send({
      messageType: 'runFileProcessor',
      pid: process.pid,
      timeMillis: Date.now()
    } satisfies RunFileProcessorWorkerMessage)
  }

  const pendingFiles = await getPendingEnergyDataFiles()

  response.json({
    success,
    pendingFiles
  })
}

export default handler
