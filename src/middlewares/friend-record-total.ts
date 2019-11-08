import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User } from '../models';

const { ObjectId } = Types;

export const totalFriendRecordMiddleware = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id: myUserId } = req.user;

        const aggregated = await User.aggregate([
            { $match: { _id: ObjectId(myUserId) } },
            {
                $group: {
                    _id: '$_id',
                    friends: { $first: '$friends' }
                }
            },
            {
                $unwind: '$friends'
            },
            {
                $lookup: {
                    from: 'friends',
                    localField: 'friends',
                    foreignField: '_id',
                    as: 'friends'
                }
            },
            { $unwind: '$friends' },
            { $match: { 'friends.status': { $eq: 3 } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'friends.recipient',
                    foreignField: '_id',
                    as: 'friends.recipient'
                }
            },
            { $unwind: '$friends.recipient' },
            {
                $group: {
                    _id: '$friends.recipient._id',
                    records: { $first: '$friends.recipient.records' },
                    username: { $first: '$friends.recipient.username' },
                }
            },
            {
                $lookup: {
                    from: 'ratings',
                    localField: 'records',
                    foreignField: '_id',
                    as: 'records'
                }
            },
            { $unwind: '$records' },
            {
                $group: {
                    _id: '$_id',
                    username: { $first: '$username' },
                    records: { $first: '$records' },
                }
            },
            { $project: { 'records._id': 0, 'records.user': 0, 'records.email': 0, 'records.__v': 0 } },

        ]);

        const recordsDoc = aggregated.slice();

        const friendRecords = recordsDoc.map(({ username, records }: any) => {
            const arr = Object.keys(records);
            const totalRecord = arr.reduce((prev: any, cur: any) => {
                return prev + records[cur];
            }, 0);

            return {
                username,
                totalRecord
            };
        });


        let sorted = friendRecords.sort((a: any, b: any) => b.totalRecord - a.totalRecord);
        sorted = sorted.map((item: any, index: number) => ({ ...item, position: index + 1 })).filter(Boolean);

        req.friendRecords = sorted;

        next();

    }
    catch (err) {
        next(err);
    }

};