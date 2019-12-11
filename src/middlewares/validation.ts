import { Response, Request, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validationResult(req).throw();
        next();
    }
    catch (err) {
        return res.status(200).json({ status: 'error', errors: err.array() });
    }
};