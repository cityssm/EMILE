import './polyfills.js';
import { getSafeRedirectURL } from './functions.authentication.js';
import { getConfigProperty } from './functions.config.js';
const sessionCookieName = getConfigProperty('session.cookieName');
export function sessionHandler(request, response, next) {
    if (hasActiveSession(request)) {
        next();
        return;
    }
    const redirectUrl = getSafeRedirectURL(request.originalUrl);
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/login?redirect=${encodeURIComponent(redirectUrl)}`);
}
export function hasActiveSession(request) {
    return (Object.hasOwn(request.session, 'user') &&
        Object.hasOwn(request.cookies, sessionCookieName));
}
