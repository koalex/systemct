'use strict';

const config        = require('config');
const LocalStrategy = require('passport-local').Strategy;
const User          = require('../../user/models/user');
const Socket        = require('../../../libs/socket');
const { USERS, _CREATE, _READ, _UPDATE, _DELETE, _SUCCESS, _ERROR } = require(config.actionsRoot);

module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
},
function (email, password, done) {
    User.findOne({ email: email, active: true }, function (err, user) {

        if (err) return done(err);

        if (!user) return done(null, false, { field: 'email', message: 'USER_NOT_FOUND' });

        if (user.locked) {
            user.incSigninAttempts(false, err => {
                if (err) console.log(err);

                user = user.toJSON();

                config.roles.filter(role => role !== 'manager').forEach(role => {
                    Socket.emitter.of('/api').to(role).emit(USERS + _UPDATE + _SUCCESS, user);
                });
            });

            return done(null, false, { field: 'email', message: 'USER_BLOCKED' });
        }
        if (!user.checkPassword(password)) {

            user.incSigninAttempts(false, err => { if (err) console.log(err); });
            return done(null, false, { field: 'password', message: 'WRONG_PASSWORD' });
        }

        user.incSigninAttempts(true);
        return done(null, user);
    });
});

