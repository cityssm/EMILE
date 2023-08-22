import { deleteDatabaseBackupFile, getBackedUpDatabaseFiles } from '../../helpers/functions.database.js';
export async function handler(request, response) {
    await deleteDatabaseBackupFile(request.body.fileName);
    const backupFiles = await getBackedUpDatabaseFiles();
    response.json({
        success: true,
        backupFiles
    });
}
export default handler;
