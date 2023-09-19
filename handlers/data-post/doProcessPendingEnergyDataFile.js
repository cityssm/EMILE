import { getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
import { updateEnergyDataFileAsReadyToProcess } from '../../database/updateEnergyDataFile.js';
export async function handler(request, response) {
    const success = updateEnergyDataFileAsReadyToProcess(request.body.fileId, request.session.user);
    if (process.send !== undefined) {
        process.send({
            messageType: 'runFileProcessor',
            pid: process.pid,
            timeMillis: Date.now()
        });
    }
    const pendingFiles = await getPendingEnergyDataFiles();
    response.json({
        success,
        pendingFiles
    });
}
export default handler;
