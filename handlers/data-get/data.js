import { getFailedEnergyDataFiles, getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
export function handler(request, response) {
    const pendingFiles = getPendingEnergyDataFiles();
    const failedFiles = getFailedEnergyDataFiles();
    response.render('data', {
        headTitle: 'Data',
        pendingFiles,
        failedFiles
    });
}
export default handler;
