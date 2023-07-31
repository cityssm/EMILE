import { Router } from 'express';
import handler_data from '../handlers/data-get/data.js';
import handler_doUploadDataFiles from '../handlers/data-post/doUploadDataFiles.js';
export const router = Router();
router.get('/', handler_data);
router.post('/doUploadDataFiles', handler_doUploadDataFiles.uploadHander.array('file'), handler_doUploadDataFiles.successHandler);
export default router;
