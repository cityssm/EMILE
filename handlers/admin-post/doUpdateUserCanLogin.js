import { updateUserCanLogin } from '../../database/updateUser.js';
export async function handler(request, response) {
    const success = await updateUserCanLogin(request.body.userName, request.body.permissionValue, request.session.user);
    response.json({
        success
    });
}
export default handler;
