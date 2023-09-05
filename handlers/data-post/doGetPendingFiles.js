import { getPendingEnergyDataFiles, getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
export function handler(request, response) {
    const pendingFiles = getPendingEnergyDataFiles();
    const processedFiles = getProcessedEnergyDataFiles('');
    response.json({
        success: true,
        pendingFiles,
        processedFiles
    });
}
export default handler;
