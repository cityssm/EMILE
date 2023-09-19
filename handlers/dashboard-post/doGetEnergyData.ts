import type { Request, Response } from 'express'

import { getEnergyData } from '../../database/getEnergyData.js'

export async function handler(request: Request, response: Response): Promise<void> {
  const energyData = await getEnergyData(request.body)

  response.json({
    success: true,
    energyData
  })
}

export default handler
