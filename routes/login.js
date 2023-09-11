import { isAbuser, recordAbuse } from '@cityssm/express-abuse-points';
import { Router } from 'express';
import { addUserAccessLog } from '../database/addUserAccessLog.js';
import { getUser } from '../database/getUser.js';
import { updateUserReportKey } from '../database/updateUser.js';
import * as authenticationFunctions from '../helpers/functions.authentication.js';
import { getConfigProperty } from '../helpers/functions.config.js';
export const router = Router();
function getHandler(request, response) {
    const sessionCookieName = getConfigProperty('session.cookieName');
    if (request.session.user !== undefined &&
        request.cookies[sessionCookieName] !== undefined) {
        const redirectURL = authenticationFunctions.getSafeRedirectURL((request.query.redirect ?? ''));
        response.redirect(redirectURL);
    }
    else {
        response.render('login', {
            userName: '',
            message: '',
            isAbuser: false,
            redirect: request.query.redirect
        });
    }
}
async function postHandler(request, response) {
    const userName = (typeof request.body.userName === 'string' ? request.body.userName : '');
    const passwordPlain = (typeof request.body.password === 'string' ? request.body.password : '');
    const unsafeRedirectURL = request.body.redirect;
    const redirectURL = authenticationFunctions.getSafeRedirectURL(typeof unsafeRedirectURL === 'string' ? unsafeRedirectURL : '');
    let isAuthenticated = false;
    let isTemporaryUser = false;
    let userObject;
    if (userName.startsWith('~~')) {
        isTemporaryUser = true;
        const potentialUser = getConfigProperty('tempUsers').find((possibleUser) => {
            return possibleUser.user.userName === userName;
        });
        if ((potentialUser?.user.canLogin ?? false) &&
            passwordPlain !== '' &&
            passwordPlain ===
                potentialUser.password) {
            isAuthenticated = true;
            userObject = potentialUser.user;
        }
    }
    else if (userName !== '' && passwordPlain !== '') {
        isAuthenticated = await authenticationFunctions.authenticate(userName, passwordPlain);
    }
    if (isAuthenticated && !isTemporaryUser) {
        const userNameLowerCase = userName.toLowerCase();
        userObject = getUser(userNameLowerCase);
        if (userObject !== undefined && (userObject.reportKey ?? '') === '') {
            const newReportKey = updateUserReportKey(userObject.userName, userObject);
            userObject.reportKey =
                typeof newReportKey === 'boolean' ? '' : newReportKey;
        }
    }
    if (isAuthenticated && (userObject?.canLogin ?? false)) {
        request.session.user = userObject;
        addUserAccessLog(userObject, request.ip);
        response.redirect(redirectURL);
    }
    else {
        recordAbuse(request);
        const isAbuserBoolean = await isAbuser(request);
        response.render('login', {
            userName,
            message: 'Login Failed',
            isAbuser: isAbuserBoolean,
            redirect: redirectURL
        });
    }
}
router
    .route('/')
    .get(getHandler)
    .post(postHandler);
export default router;
