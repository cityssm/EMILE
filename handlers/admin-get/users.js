import { getUsers } from '../../database/getUsers.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
export async function handler(request, response) {
    const users = await getUsers();
    const temporaryUsers = getConfigProperty('tempUsers');
    response.render('admin-users', {
        headTitle: 'User Maintenance',
        menuItem: 'Settings',
        users,
        temporaryUsers
    });
}
export default handler;
