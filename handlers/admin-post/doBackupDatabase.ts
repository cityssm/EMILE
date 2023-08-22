import type { Request, Response } from 'express'

import {
  backupDatabase,
  getBackedUpDatabaseFiles
} from '../../helpers/functions.database.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await backupDatabase()

  const backupFiles = await getBackedUpDatabaseFiles()

  response.json({
    success: typeof success === 'string',
    backupFiles
  })
}

export default handler
