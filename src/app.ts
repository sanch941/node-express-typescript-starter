import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import compression from 'compression';  // compresses requests
import path from 'path';
import { authenticate } from 'passport';
import multer from 'multer';
// Controllers
import { notFound, register, login, resetPassword, changePassword, isEmailUnique, registerValidate, loginValidate, changePasswordValidate, resetPaswordValidate, isEmailUniqueValidate, userInfo, logout, verifyToken, deleteUser, changeUsername, changeUsernameValidate, uploadImage } from './controllers';
import { checkUserAgent } from './util';
import { checkToken, errorHandler } from './middlewares';

// Create Express server
const app = express();

// Connect to MongoDB
const connectToDb = async (): Promise<void> => {
    try {
        await connect(
            'mongodb://localhost:27017/hackathon',
            { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }
        );

        console.log('Connected to Mongodb');
    }
    catch (err) {
        console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
    }
};
connectToDb();

const upload = multer({ dest: 'static/uploads/' });

app.set('port', process.env.PORT || 3001);
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
app.post('/api/register', registerValidate, checkUserAgent, register);
app.post('/api/login', loginValidate, checkUserAgent, login);
app.post('/api/reset-password', resetPaswordValidate, checkUserAgent, resetPassword);
app.post('/api/change-password', auth.required, changePasswordValidate, changePassword);
app.post('/api/exists-email', isEmailUniqueValidate, isEmailUnique);
app.get('/api/user-info', auth.required, userInfo);
app.get('/api/logout', auth.required, logout);
app.get('/api/verify-token', verifyToken);
app.post('/api/delete-user', deleteUser);
app.post('/api/username', auth.required, changeUsernameValidate, changeUsername);
// Image
app.post('/api/upload-image', upload.array('files[]'), uploadImage);

// Error handling
app.get('*', notFound);
app.use(errorHandler);
export default app;