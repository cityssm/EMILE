import type { Request, Response } from 'express'

import { cleanupDatabase } from '../../database/cleanupDatabase.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const deleteCount = await cleanupDatabase()

  response.json({
    success: true,
    deleteCount
  })
}

export default handler
