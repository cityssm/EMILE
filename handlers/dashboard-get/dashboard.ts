import type { Request, Response } from 'express'

export function handler(request: Request, response: Response): void {
  response.render('dashboard', {
    headTitle: 'Dashboard'
  })
}

export default handler
