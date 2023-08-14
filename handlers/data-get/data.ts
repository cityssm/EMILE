import type { Request, Response } from 'express'

import { getAssets } from '../../database/getAssets.js'
import {
  getFailedEnergyDataFiles,
  getPendingEnergyDataFiles
} from '../../database/getEnergyDataFiles.js'

export function handler(request: Request, response: Response): void {
  const pendingFiles = getPendingEnergyDataFiles()
  const failedFiles = getFailedEnergyDataFiles()

  const assets = getAssets()

  response.render('data', {
    headTitle: 'Data',
    pendingFiles,
    failedFiles,
    assets
  })
}

export default handler
