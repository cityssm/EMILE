import type { Request, Response } from 'express'

export function handler(request: Request, response: Response): void {
  response.render('admin', {
    headTitle: 'Administrator Settings',
    menuItem: 'Settings'
  })
}

export default handler
