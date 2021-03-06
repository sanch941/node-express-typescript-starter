import { Response, Request, NextFunction } from 'express';
import { User } from '../../models';
import { check, validationResult } from 'express-validator';
import { cleanUnnecessary } from '../../util';

export const registerValidate = [
    check('email')
        .trim()
        .bail()
        .exists().withMessage({ statusCode: 1, message: 'email is required' })
        .bail()
        .not().isEmpty().withMessage({ statusCode: 2, message: 'email is empty' })
        .bail()
        .isEmail().withMessage({ statusCode: 3, message: 'it is not email' })
        .bail()
        .custom(async value => {
            const exists = await User.isEmailExists(value);
            if (exists) { return Promise.reject(); }
        }).withMessage({ statusCode: 4, message: 'email already in use' })
        .bail()
        .isLength({ max: 64 }).withMessage({ statusCode: 5, message: 'shall not exceed 32 characters' }),

    check('password')
        .trim()
        .exists().withMessage({ statusCode: 6, message: 'password is required' })
        .bail()
        .not().isEmpty().withMessage({ statusCode: 7, message: 'password is empty' })
        .bail()
        .isLength({ max: 32 }).withMessage({ statusCode: 8, message: 'shall not exceed 16 characters' }),

    check('username')
        .trim()
        .exists().withMessage({ statusCode: 9, message: 'username is required' })
        .bail()
        .not().isEmpty().withMessage({ statusCode: 10, message: 'username is empty' })
        .bail()
        .custom(async value => {
            const exists = await User.isUsernameExists(value);
            if (exists) { return Promise.reject(); }
        }).withMessage({ statusCode: 11, message: 'username is already on use' })
        .bail()
        .isLength({ max: 32 }).withMessage({ statusCode: 12, message: 'shall not exceed 16 characters' })
];

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { email, password, username = {} } = req.body;

        // Валидация
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let cleaned = cleanUnnecessary(errors.array());
            cleaned = cleaned.map((item: any) => ({ ...item, message: res.__(item.message) }));

            return res.status(200).json({ status: 'rejected', errors: cleaned });
        }

        // Создаем id для рейтинга и user                
        const finalUser = new User({
            email,
            username
        });

        finalUser.setPassword(password);
        finalUser.setUid();
        await finalUser.save();

        const result = await finalUser.toAuthJSON();
        res.json(result);
    }

    catch (err) {
        next(err);
    }

};