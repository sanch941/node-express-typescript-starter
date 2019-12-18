import { Response, Request, NextFunction } from 'express';
import { uploadImageValidate } from './upload-image-validate';
import { validation } from '../../middlewares';
import gm from 'gm';
import async from 'async';
import fs from 'fs';
import nodePath from 'path';

const _uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        req.files = req.files as Express.Multer.File[];

        const files: any = req.files.slice();
        // const otherInfo = req.body.otherInfo.slice();
        // otherInfo = otherInfo.map((item: any) => JSON.parse(item));               

        // passOver похоже на next из express middleware - продолжает цикл
        async.each(files, ({ path, destination, filename, originalname }: MulterFileToUpload, passOver) => {

            const resizeImage = (width: number = null, height: number = null): Promise<any> => {
                return new Promise((resolve, reject) => {
                    const optimizedPathFolder = `${destination}/../optimized/${width}/`;
                    const optimizedPathFile = `${optimizedPathFolder}/${width}-${filename}`;

                    // Если нет папки с названием ширины,  то создать ее
                    !fs.existsSync(optimizedPathFolder) && fs.mkdirSync(optimizedPathFolder);
                    // Убрать мусор из картинки и изменить ее размер

                    const configure = (type: string): Promise<any> => {
                        return new Promise((resolve2, reject2) => {

                            gm(path).noProfile().resize(width, height).toBuffer(type, () => ({})).write(optimizedPathFile + '.' + type, (err) => {
                                if (err) return reject2(err);

                                resolve2();
                            });
                        });
                    };

                    // path.extname убирает все что было до точки, оставляя только .jpg, .png. Документация - https://nodejs.org/api/path.html#path_path_extname_path
                    const originalNameWithoutDot = nodePath.extname(originalname).split('.').join('');

                    const allConfigured = [configure('webp'), configure(originalNameWithoutDot)];

                    Promise.all(allConfigured).then(() => {
                        resolve();
                    }).catch((err) => {
                        reject(err);
                    });
                });
            };


            const allResizePromisses = [
                resizeImage(1920), resizeImage(1600), resizeImage(1366),
                resizeImage(1024), resizeImage(768), resizeImage(640)
            ];

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


