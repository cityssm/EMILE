import { getPendingEnergyDataFiles, getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
export async function handler(request, response) {
    const pendingFiles = await getPendingEnergyDataFiles();
    const processedFiles = await getProcessedEnergyDataFiles('');
    response.json({
        success: true,
        pendingFiles,
        processedFiles
    });
}
export default handler;
