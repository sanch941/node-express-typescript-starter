import multer from 'multer';
import path from 'path';

let pathTo: string;
// В зависимости от ос изменить путь
switch (process.platform) {
    case 'win32':
        pathTo = 'C:/laragon/www/profrem-constructor-api/src/uploads/original';
        break;
    case 'linux':
        pathTo = '';
        break;
    default:
        break;
}

// path.extname убирает все что было до точки, оставляя только .jpg, .png. Документация - https://nodejs.org/api/path.html#path_path_extname_path
const fileName = ({ fieldname, originalname }: MulterFileToUpload) => {

    return `original-${fieldname}-${Date.now() + path.extname(originalname)}`;
};

// Конфиг, куда падает файл и название файла
export const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pathTo);
    },
    filename: function (req, file, cb) {
        cb(null, fileName(file));
    }
});
