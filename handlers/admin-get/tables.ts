import type { Request, Response } from 'express'

export function handler(request: Request, response: Response): void {
  response.render('admin-tables', {
    headTitle: 'Table Maintenance'
  })
}

export default handler
