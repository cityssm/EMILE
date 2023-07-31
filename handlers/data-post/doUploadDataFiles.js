import multer from 'multer';
export const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, './data/files/uploads');
    },
    filename: (request, file, callback) => {
        callback(null, `[${Date.now().toString()}]${file.originalname}`);
    }
});
export function successHandler(request, response) {
    response.json({
        success: true
    });
}
export default {
    uploadHander: multer({ storage }),
    successHandler
};
