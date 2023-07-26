import type { Request, Response } from 'express'

export function handler(request: Request, response: Response): void {
  response.render('reports', {
    headTitle: 'Report Library'
  })
}

export default handler
