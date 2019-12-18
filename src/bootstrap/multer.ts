import multer from 'multer';

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

const fileName = ({ fieldname }: MulterFileToUpload) => {

    return `original-${fieldname}-${Date.now()}`;
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
