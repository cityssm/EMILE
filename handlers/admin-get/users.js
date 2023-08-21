import { getUsers } from '../../database/getUsers.js';
export function handler(request, response) {
    const users = getUsers();
    response.render('admin-users', {
        headTitle: 'User Maintenance',
        users
    });
}
export default handler;
