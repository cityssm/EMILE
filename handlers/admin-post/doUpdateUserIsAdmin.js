import { updateUserIsAdmin } from '../../database/updateUser.js';
export function handler(request, response) {
    const success = updateUserIsAdmin(request.body.userName, request.body.permissionValue, request.session.user);
    response.json({
        success
    });
}
export default handler;
