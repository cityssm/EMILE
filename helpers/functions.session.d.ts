import type { NextFunction, Request, Response } from 'express';
export declare function sessionHandler(request: Request, response: Response, next: NextFunction): void;
export declare function hasActiveSession(request: Request): boolean;
