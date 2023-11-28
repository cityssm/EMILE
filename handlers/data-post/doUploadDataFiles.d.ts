import type { Request, Response } from 'express';
import multer from 'multer';
export declare const storage: multer.StorageEngine;
export declare function successHandler(request: Request, response: Response): Promise<void>;
export declare const handlers: {
    uploadHander: multer.Multer;
    successHandler: typeof successHandler;
};
