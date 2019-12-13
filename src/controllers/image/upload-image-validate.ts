import { body } from 'express-validator';

export const uploadImageValidate = [
    body('otherInfo').not().isEmpty().withMessage(' Otherinfo is empty ')
];