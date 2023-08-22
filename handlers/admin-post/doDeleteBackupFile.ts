import type { Request, Response } from 'express'

import {
  deleteDatabaseBackupFile,
  getBackedUpDatabaseFiles
} from '../../helpers/functions.database.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  await deleteDatabaseBackupFile(request.body.fileName)

  const backupFiles = await getBackedUpDatabaseFiles()

  response.json({
    success: true,
    backupFiles
  })
}

export default handler
