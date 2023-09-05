import type { Request, Response } from 'express'

import { getAssets } from '../../database/getAssets.js'
import {
  getPendingEnergyDataFiles,
  getProcessedEnergyDataFiles
} from '../../database/getEnergyDataFiles.js'
import { getParserClassesAndConfigurations } from '../../parsers/parserHelpers.js'

export function handler(request: Request, response: Response): void {
  const pendingFiles = getPendingEnergyDataFiles()
  const processedFiles = getProcessedEnergyDataFiles('')

  const assets = getAssets()

  const parserClassesAndConfigurations = getParserClassesAndConfigurations()

  response.render('data', {
    headTitle: 'Data',
    menuItem: 'Data',

    pendingFiles,
    processedFiles,
    assets,
    parserClassesAndConfigurations
  })
}

export default handler
