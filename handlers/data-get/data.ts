import type { Request, Response } from 'express'

export function handler(request: Request, response: Response): void {
  response.render('data', {
    headTitle: 'Data'
  })
}

export default handler
