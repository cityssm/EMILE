import { deleteEnergyDataByFileId } from '../../database/deleteEnergyData.js';
import { getPendingEnergyDataFiles, getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
import { updateEnergyDataFileAsReadyToPending } from '../../database/updateEnergyDataFile.js';
export async function handler(request, response) {
    await deleteEnergyDataByFileId(request.body.fileId, request.session.user);
    const success = updateEnergyDataFileAsReadyToPending(request.body.fileId, request.session.user);
    const pendingFiles = getPendingEnergyDataFiles();
    const processedFiles = getProcessedEnergyDataFiles('');
    response.json({
        success,
        pendingFiles,
        processedFiles
    });
}
export default handler;
