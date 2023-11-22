import {
  type NextFunction,
  type Request,
  type Response,
  Router,
  type RequestHandler
} from 'express'

import { isValidUserReportKey } from '../database/isValidUserReportKey.js'
import handler_reportName from '../handlers/reports-get/reportName.js'
import handler_reports from '../handlers/reports-get/reports.js'
import { getSafeRedirectURL } from '../helpers/functions.authentication.js'
import { getConfigProperty } from '../helpers/functions.config.js'
import {
  hasActiveSession,
  sessionHandler
} from '../helpers/functions.session.js'

export const router = Router()

const reportKeyReportNames = new Set<string>()
reportKeyReportNames.add('energyData-fullyJoined')
reportKeyReportNames.add('energyData-fullyJoined-daily')

function sessionOrReportKeyHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (hasActiveSession(request)) {
    next()
    return
  }

  const reportName: string = request.params.reportName

  if (
    reportKeyReportNames.has(reportName) &&
    isValidUserReportKey(request.query.reportKey as string, request.ip)
  ) {
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

router.get('/', sessionHandler, handler_reports as RequestHandler)

router.all(
  '/:reportName',
  sessionOrReportKeyHandler,
  handler_reportName as RequestHandler
)

export default router
