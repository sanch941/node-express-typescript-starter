import { Response, NextFunction } from 'express';
import { User } from '../models';

export const getAchievementsMiddleware = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id: myUserId } = req.user;

        const { records } = await User.findById(myUserId);

        let achievements = {
            fastHand: false,
            attentiveness: false,
            goodMemory: false
        };

        if (records.shulteTable >= 15000) {
            achievements.fastHand = true;
        }

        if (records.rememberNumber >= 1900 || records.rememberWords >= 1900 || records.memorySquare >= 5000) {
            achievements.goodMemory = true;
        }

        if (records.coloredWords >= 2000) {
            achievements.attentiveness = true;
        }

        req.achievements = achievements;

        next();


    }
    catch (err) {
        next(err);
    }
};