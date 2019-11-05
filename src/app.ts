import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import compression from 'compression';  // compresses requests
import path from 'path';
import { authenticate } from 'passport';
// Controllers
import { notFound, register, login, resetPassword, changePassword, getWorldRating, friendRequest, friendReject, friendAccept, getFriendRating, createRating, getStatusesOutgoing, getStatusesIncoming, isUsernameUnique, isEmailUnique, registerValidate, loginValidate, changePasswordValidate, resetPaswordValidate, isEmailUniqueValidate, isUsernameUniqueValidate, createRatingValidate, getRatingValidate, getRating, getWorldRatingValidate, getList, userInfo, logout, verifyToken, gameInfo, gameInfoValidate, updateRecord, deleteUser, changeUsername, changeUsernameValidate, friendRequestValidate, friendRejectValidate, friendAcceptValidate } from './controllers';
import { checkUserAgent } from './util';
import { checkToken, errorHandler } from './middlewares';

// Create Express server
const app = express();

// Connect to MongoDB
const connectToDb = async (): Promise<void> => {
    try {
        await connect(
            'mongodb://localhost:27017/boom-brains',
            { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }
        );

        console.log('Connected to Mongodb');
    }
    catch (err) {
        console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
    }
};
connectToDb();

// Initialize all routes
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(cors());
app.use(compression());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
    express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
);

// Passport config
import './config/passport';

// *** Routes

// Middleware для авторизованных
// Перед запросом будет проверка есть ли токен, также дает доступ к текущему пользователю
const authJwt = authenticate('jwt', { session: false });
const auth = {
    required: [authJwt, checkToken]
};

// Auth
app.post('/auth/register', registerValidate, checkUserAgent, register);
app.post('/auth/login', loginValidate, checkUserAgent, login);
app.post('/auth/reset-password', resetPaswordValidate, checkUserAgent, resetPassword);
app.post('/auth/change-password', auth.required, changePasswordValidate, changePassword);
app.post('/auth/exists-email', isEmailUniqueValidate, isEmailUnique);
app.post('/auth/exists-username', isUsernameUniqueValidate, isUsernameUnique);
app.get('/auth/user-info', auth.required, userInfo);
app.get('/auth/logout', auth.required, logout);
app.get('/auth/verify-token', verifyToken);
app.post('/auth/delete-user', deleteUser);
app.post('/auth/username', auth.required, changeUsernameValidate, changeUsername);
// Records
app.post('/api/world-record', auth.required, getWorldRatingValidate, getWorldRating);
app.get('/api/friend-record', auth.required, getFriendRating);
app.post('/api/get-record', auth.required, getRatingValidate, getRating);
app.post('/api/record', auth.required, createRatingValidate, createRating);
app.get('/api/games-list', auth.required, getList);
app.post('/api/game-info', auth.required, gameInfoValidate, gameInfo);
app.post('/api/update-record', auth.required, updateRecord);
// Friend
app.post('/api/friend-request', auth.required, friendRequestValidate, friendRequest);
app.post('/api/friend-accept', auth.required, friendAcceptValidate, friendAccept);
app.post('/api/friend-reject', auth.required, friendRejectValidate, friendReject);
app.get('/api/status-outgoing', auth.required, getStatusesOutgoing);
app.get('/api/status-incoming', auth.required, getStatusesIncoming);
// Error handling
app.get('*', notFound);
app.use(errorHandler);

export default app;
