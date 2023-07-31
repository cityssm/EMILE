import type { Request, Response } from 'express';
import multer from 'multer';
export declare const storage: multer.StorageEngine;
export declare function successHandler(request: Request, response: Response): void;
declare const _default: {
    uploadHander: multer.Multer;
    successHandler: typeof successHandler;
};
export default _default;
