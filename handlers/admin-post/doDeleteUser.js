import { deleteUser } from '../../database/deleteUser.js';
import { getUsers } from '../../database/getUsers.js';
export function handler(request, response) {
    const success = deleteUser(request.body.userName, request.session.user);
    const users = getUsers();
    response.json({
        success,
        users
    });
}
export default handler;
