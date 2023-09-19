import { getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
import { updatePendingEnergyDataFile } from '../../database/updateEnergyDataFile.js';
export async function handler(request, response) {
    const success = updatePendingEnergyDataFile(request.body, request.session.user);
    const pendingFiles = await getPendingEnergyDataFiles();
    response.json({
        success,
        pendingFiles
    });
}
export default handler;
