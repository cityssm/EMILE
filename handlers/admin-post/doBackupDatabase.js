import { backupDatabase, getBackedUpDatabaseFiles } from '../../helpers/functions.database.js';
export async function handler(request, response) {
    const success = await backupDatabase();
    const backupFiles = await getBackedUpDatabaseFiles();
    response.json({
        success: typeof success === 'string',
        backupFiles
    });
}
export default handler;
