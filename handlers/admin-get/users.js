import { getUsers } from '../../database/getUsers.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
export function handler(request, response) {
    const users = getUsers();
    const temporaryUsers = getConfigProperty('tempUsers');
    response.render('admin-users', {
        headTitle: 'User Maintenance',
        menuItem: 'Settings',
        users,
        temporaryUsers
    });
}
export default handler;
