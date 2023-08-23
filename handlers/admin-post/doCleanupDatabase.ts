import type { Request, Response } from 'express'

import { cleanupDatabase } from '../../database/cleanupDatabase.js'

export function handler(request: Request, response: Response): void {
  const deleteCount = cleanupDatabase(request.session.user as EmileUser)

  response.json({
    success: true,
    deleteCount
  })
}

export default handler
