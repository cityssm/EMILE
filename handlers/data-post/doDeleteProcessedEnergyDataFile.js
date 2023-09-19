import { deleteEnergyDataFile } from '../../database/deleteEnergyDataFile.js';
import { getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
export async function handler(request, response) {
    const success = deleteEnergyDataFile(request.body.fileId, request.session.user);
    const processedFiles = await getProcessedEnergyDataFiles('');
    response.json({
        success,
        processedFiles
    });
}
export default handler;
