import type { Request, Response } from 'express'

import { addUser } from '../../database/addUser.js'
import { getUsers } from '../../database/getUsers.js'

export function handler(request: Request, response: Response): void {
  const success = addUser(request.body, request.session.user as EmileUser)

  const users = getUsers()

  response.json({
    success,
    users
  })
}

export default handler
