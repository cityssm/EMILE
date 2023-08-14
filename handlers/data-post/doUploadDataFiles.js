import multer from 'multer';
import { getFailedEnergyDataFiles, getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
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
    const failedFiles = getFailedEnergyDataFiles();
    response.json({
        success: true,
        pendingFiles,
        failedFiles
    });
}
export default {
    uploadHander: multer({ storage }),
    successHandler
};
