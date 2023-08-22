import { addUser } from '../../database/addUser.js';
import { getUsers } from '../../database/getUsers.js';
export function handler(request, response) {
    const success = addUser(request.body, request.session.user);
    const users = getUsers();
    response.json({
        success,
        users
    });
}
export default handler;
