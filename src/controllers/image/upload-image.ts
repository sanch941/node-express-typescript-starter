import { Response, Request, NextFunction } from 'express';
import { uploadImageValidate } from './upload-image-validate';
import { validation } from '../../middlewares';
import gm from 'gm';
import async from 'async';
import fs from 'fs';

const _uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        req.files = req.files as Express.Multer.File[];

        const files: any = req.files.slice();
        // const otherInfo = req.body.otherInfo.slice();
        // otherInfo = otherInfo.map((item: any) => JSON.parse(item));               

        // passOver похоже на next из express middleware - продолжает цикл
        async.each(files, ({ path, destination, filename }: MulterFileToUpload, passOver) => {

            const resizeImage = (width: number = null, height: number = null): Promise<any> => {
                return new Promise((resolve, reject) => {
                    const optimizedPathFolder = `${destination}/../optimized/${width}/`;
                    const optimizedPathFile = `${optimizedPathFolder}/${width}-${filename}`;

                    // Если нет папки с названием ширины,  то создать ее
                    !fs.existsSync(optimizedPathFolder) && fs.mkdirSync(optimizedPathFolder);
                    // Убрать мусор из картинки и изменить ее размер
                    gm(path).noProfile().resize(width, height).write(optimizedPathFile, (err) => {
                        if (err) return reject(err);

                        resolve();
                    });
                });
            };

            const promise80x80 = resizeImage(80);
            const promise120x120 = resizeImage(120);

            const allResizePromisses = [promise80x80, promise120x120];

            Promise.all(allResizePromisses).then(() => {
                passOver();
            }).catch((err) => {
                passOver(err);
            });


        }, (err) => {
            if (err) return next(err);
            res.json({ msg: 'Все файлы успешно загружены' });
        });

    }
    catch (err) {
        next(err);
    }
};

export const uploadImage: any = [uploadImageValidate, validation, _uploadImage];


