import { deleteEnergyDataFile } from '../../database/deleteEnergyDataFile.js';
import { getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
export function handler(request, response) {
    const success = deleteEnergyDataFile(request.body.fileId, request.session.user);
    const pendingFiles = getPendingEnergyDataFiles();
    response.json({
        success,
        pendingFiles
    });
}
export default handler;
