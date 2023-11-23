import type { Request, Response } from 'express'

import { deleteUser } from '../../database/deleteUser.js'
import { getUsers } from '../../database/getUsers.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = deleteUser(
    request.body.userName,
    request.session.user as EmileUser
  )

  const users = await getUsers()

  response.json({
    success,
    users
  })
}

export default handler
