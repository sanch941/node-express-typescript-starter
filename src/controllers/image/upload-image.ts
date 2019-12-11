import { Response, Request, NextFunction } from 'express';
import { uploadImageValidate } from './upload-image-validate';
import { validation } from '../../middlewares';
import gm from 'gm';

const _uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {

        let otherInfo = req.body.otherInfo.slice();
        otherInfo = otherInfo.map((item: any) => JSON.parse(item));

        res.json({
            files: req.files,
            otherInfo
        });

    }
    catch (err) {
        next(err);
    }
};

export const uploadImage: any = [uploadImageValidate, validation, _uploadImage];