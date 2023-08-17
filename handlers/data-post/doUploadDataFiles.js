import multer from 'multer';
import { getPendingEnergyDataFiles, getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
export const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, './data/files/uploads');
    },
    filename: (request, file, callback) => {
        callback(null, `[${Date.now().toString()}]${file.originalname}`);
    }
});
export function successHandler(request, response) {
    const pendingFiles = getPendingEnergyDataFiles();
    const processedFiles = getProcessedEnergyDataFiles('');
    response.json({
        success: true,
        pendingFiles,
        processedFiles
    });
}
export const handlers = {
    uploadHander: multer({ storage }),
    successHandler
};
