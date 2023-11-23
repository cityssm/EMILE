import { deleteUser } from '../../database/deleteUser.js';
import { getUsers } from '../../database/getUsers.js';
export async function handler(request, response) {
    const success = await deleteUser(request.body.userName, request.session.user);
    const users = await getUsers();
    response.json({
        success,
        users
    });
}
export default handler;
