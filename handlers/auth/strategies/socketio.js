'use strict';

const config        = require('config');
const jwt           = require('jsonwebtoken');
const User          = require('../../user/models/user');

const { AUTH, SIGNIN, _SUCCESS, _ERROR } = require(config.actionsRoot);


// DEPRECATED
module.exports = Socket => {
    Socket.io
        .on('connection', socket => {
            socket
                .on(AUTH + SIGNIN, data => {

                    (async () => {
                        await new Promise(resolve => { setTimeout(() => { resolve(); }, 200) }); // Anti-brutforce

                        if (!data || !data.email || !data.password) {
                            socket.emit(AUTH + SIGNIN + _ERROR, { status: 400, message: socket.i18n.__('BAD_REQUEST') });
                        } else {

                            if (!String(data.email).trim() || !String(data.password).trim()) {
                                socket.emit(AUTH + SIGNIN + _ERROR, { status: 400, message: socket.i18n.__('BAD_REQUEST') });
                                return;
                            }

                            let user = await User.findOne({ email: data.email, deleted: false });

                            if (!user) {
                                socket.emit(AUTH + SIGNIN + _ERROR, { status: 400, field: 'email', message: socket.i18n.__('USER_NOT_FOUND') });
                                return;
                            }
                            if (user.signin_attempts > 3 || !user.active) {
                                socket.emit(AUTH + SIGNIN + _ERROR, { status: 400, field: 'email', message: socket.i18n.__('USER_BLOCKED') });
                                return;
                            }
                            if (!user.checkPassword(data.password)) {
                                if (!user.signin_attempts && user.signin_attempts != 0) user.signin_attempts = 0;
                                user.signin_attempts += 1;
                                if (user.immortal == true) user.signin_attempts = 0;
                                if (user.signin_attempts > 3) user.active = false;
                                await user.save();
                                socket.emit(AUTH + SIGNIN + _ERROR, { status: 400, field: 'password', message: socket.i18n.__('WRONG_PASSWORD') });
                                return;
                            }

                            let token = jwt.sign({ user_id: user._id, token_uuid: user.token_uuid }, config.secret, { expiresIn: '30 days' });

                            user.last_activity   = Date.now();
                            user.last_ip_address = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;

                            await user.save();

                            socket.user = user;

                            socket.emit(AUTH + SIGNIN + _SUCCESS, { access_token: token, user/*user_id: user._id*/ });

                        }

                    })();
            });
        });
};