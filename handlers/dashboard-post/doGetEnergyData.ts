import type { Request, Response } from 'express'

import { getEnergyData } from '../../database/getEnergyData.js'

export function handler(request: Request, response: Response): void {
  const energyData = getEnergyData(request.body)

  response.json({
    success: true,
    energyData
  })
}

export default handler
