import type { Request, Response } from 'express'

import { deleteUser } from '../../database/deleteUser.js'
import { getUsers } from '../../database/getUsers.js'

export function handler(request: Request, response: Response): void {
  const success = deleteUser(request.body.userName, request.session.user as EmileUser)

  const users = getUsers()

  response.json({
    success,
    users
  })
}

export default handler
