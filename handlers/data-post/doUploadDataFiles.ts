import type { Request, Response } from 'express'
import multer from 'multer'

import { getPendingEnergyDataFiles, getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js'

export const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    // eslint-disable-next-line unicorn/no-null
    callback(null, './data/files/uploads')
  },
  filename: (request, file, callback) => {
    // eslint-disable-next-line unicorn/no-null, @typescript-eslint/restrict-template-expressions
    callback(null, `[${Date.now().toString()}]${file.originalname}`)
  }
})

export async function successHandler(request: Request, response: Response): Promise<void> {
  const pendingFiles = await getPendingEnergyDataFiles()
  const processedFiles = await getProcessedEnergyDataFiles('')

  response.json({
    success: true,
    pendingFiles,
    processedFiles
  })
}

export const handlers = {
  uploadHander: multer({ storage }),
  successHandler
}
