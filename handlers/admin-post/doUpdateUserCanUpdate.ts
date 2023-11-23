import type { Request, Response } from 'express'

import { updateUserCanUpdate } from '../../database/updateUser.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateUserCanUpdate(
    request.body.userName,
    request.body.permissionValue,
    request.session.user as EmileUser
  )

  response.json({
    success
  })
}

export default handler
