import { getBackedUpDatabaseFiles } from '../../helpers/functions.database.js';
export async function handler(request, response) {
    const backupFiles = await getBackedUpDatabaseFiles();
    response.render('admin-database', {
        headTitle: 'Database Maintenance',
        menuItem: 'Settings',
        backupFiles
    });
}
export default handler;
