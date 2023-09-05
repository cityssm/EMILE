import type { Request, Response } from 'express'

import { getBackedUpDatabaseFiles } from '../../helpers/functions.database.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const backupFiles = await getBackedUpDatabaseFiles()

  response.render('admin-database', {
    headTitle: 'Database Maintenance',
    menuItem: 'Settings',
    backupFiles
  })
}

export default handler
