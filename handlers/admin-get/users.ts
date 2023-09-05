import type { Request, Response } from 'express'

import { getUsers } from '../../database/getUsers.js'

export function handler(request: Request, response: Response): void {
  const users = getUsers()

  response.render('admin-users', {
    headTitle: 'User Maintenance',
    menuItem: 'Settings',
    users
  })
}

export default handler
