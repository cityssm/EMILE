import type { Request, Response } from 'express'
import multer from 'multer'

import { getFailedEnergyDataFiles, getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js'

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

export function successHandler(request: Request, response: Response): void {
  const pendingFiles = getPendingEnergyDataFiles()
  const failedFiles = getFailedEnergyDataFiles()

  response.json({
    success: true,
    pendingFiles,
    failedFiles
  })
}

export default {
  uploadHander: multer({ storage }),
  successHandler
}
