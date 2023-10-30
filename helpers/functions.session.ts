import type { NextFunction, Request, Response } from 'express'

import { getSafeRedirectURL } from './functions.authentication.js'
import { getConfigProperty } from './functions.config.js'

const sessionCookieName: string = getConfigProperty('session.cookieName')

export function sessionHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (hasActiveSession(request)) {
    next()
    return
  }

  const redirectUrl = getSafeRedirectURL(request.originalUrl)

  response.redirect(
    `${getConfigProperty(
      'reverseProxy.urlPrefix'
    )}/login?redirect=${encodeURIComponent(redirectUrl)}`
  )
}

export function hasActiveSession(request: Request): boolean {
  return (
    Object.hasOwn(request.session, 'user') &&
    Object.hasOwn(request.cookies, sessionCookieName)
  )
}
