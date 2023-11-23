import type { Request, Response } from 'express';
export declare const storage: any;
export declare function successHandler(request: Request, response: Response): Promise<void>;
export declare const handlers: {
    uploadHander: any;
    successHandler: typeof successHandler;
};
