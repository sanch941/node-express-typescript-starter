import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

import { User } from '../models';

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
}, (email, password, done: any) => {
    User.findOne({ email }, (err, user) => {
        if (err) return done(err);

        // if email is incorrect
        if (!user) return done(null, false, {
            status: 'rejected',
            statusCode: 1,
            message: 'Incorrect email'
        });

        // if password is incorrect
        if (!user.validatePassword(password)) {
            return done(null, false, {
                status: 'rejected',
                statusCode: 3,
                message: 'Incorrect password'
            });
        }

        return done(null, user);
    });
}));

const jwtOpt = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
};

passport.use(new JWTStrategy(jwtOpt, (jwtPayload, done) => {
    User.findById(jwtPayload.id, (err, user) => {
        if (err) return done(err);

        if (user) {
            return done(null, user);
        }

        return done(null, false);
    });
}));