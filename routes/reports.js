import { Router } from 'express';
import { isValidUserReportKey } from '../database/isValidUserReportKey.js';
import handler_reportName from '../handlers/reports-get/reportName.js';
import handler_reports from '../handlers/reports-get/reports.js';
import { getSafeRedirectURL } from '../helpers/functions.authentication.js';
import { getConfigProperty } from '../helpers/functions.config.js';
import { hasActiveSession, sessionHandler } from '../helpers/functions.session.js';
export const router = Router();
const reportKeyReportNames = new Set();
reportKeyReportNames.add('energyData-fullyJoined');
function sessionOrReportKeyHandler(request, response, next) {
    if (hasActiveSession(request)) {
        next();
        return;
    }
    const reportName = request.params.reportName;
    if (reportKeyReportNames.has(reportName) &&
        isValidUserReportKey(request.query.reportKey, request.ip)) {
        next();
        return;
    }
    const redirectUrl = getSafeRedirectURL(request.originalUrl);
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/login?redirect=${encodeURIComponent(redirectUrl)}`);
}
router.get('/', sessionHandler, handler_reports);
router.all('/:reportName', sessionOrReportKeyHandler, handler_reportName);
export default router;
