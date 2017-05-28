/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===           SOCKET         ===
 ================================
 */

'use strict';

const config 		 = require('config');
const fs             = require('fs');
const path           = require('path');
const join           = path.join;
const basename       = path.basename;
const socketIO 		 = require('socket.io');
const socketEmitter  = require('socket.io-emitter');
const socketIORedis  = require('socket.io-redis');
const redisClient 	 = require('redis').createClient({ host: 'localhost', port: 6379 });
const Cookies 		 = require('cookies');
const acceptLanguage = require('accept-language');
const User           = require('../handlers/user/models/user');
const jwt            = require('jsonwebtoken');
const BlackList      = require('../handlers/auth/models/blacklist');

const socketPrefix   = 'S_';

// https://msdn.microsoft.com/en-us/library/ms533052(v=vs.85).aspx
let locales = fs.readdirSync(join(__dirname, '../i18n')).map(localeFileName => basename(localeFileName, '.json'));
acceptLanguage.languages(locales);

const i18n           = new (require('i18n-2'))({
    directory: join(__dirname, '../i18n'),
    locales: locales,
    defaultLocale: config.defaultLocale,
    extension: '.json'
});

function tokenFromSocket (socket) {
    let handshakeData = socket.request; // http request
    const cookies     = new Cookies(handshakeData, {}, config.secret);

    let token;

    if (handshakeData.query && handshakeData.query.access_token) {
        token = handshakeData.query.access_token;
    } else if (handshakeData._query && handshakeData._query.access_token) {
        token = handshakeData._query.access_token;
    } else if (handshakeData.headers && handshakeData.headers['x-access-token']) {
        token = handshakeData.headers['x-access-token'];
    } else if (cookies.get('x-access-token')) {
        token = cookies.get('x-access-token');
    }

    return token;
}


function Socket (server) {
    let io = socketIO(server, { transports: ['websocket'] });
    io.adapter(socketIORedis({ host: 'localhost', port: 6379 })); // TODO: not working wiwth socket.io v2

    io.of('/api').use((socket, next) => {
        let handshakeData = socket.request; // http request
        const cookies     = new Cookies(handshakeData, {}, config.secret);
        let locale;

        if (cookies.get('locale')) {
            locale = cookies.get('locale');
        } else if (handshakeData.query && handshakeData.query.locale) {
            locale = handshakeData.query.locale;
        } else if (handshakeData._query && handshakeData._query.locale) {
            locale = handshakeData._query.locale;
        } else if (socket.handshake.headers['accept-language']) {
            locale = acceptLanguage.get(socket.handshake.headers['accept-language']);
        } else {
            locale = config.defaultLocale
        }

        i18n.setLocale(locale);

        socket.i18n = i18n;

        let token = tokenFromSocket(socket);

        if (!token || token === 'null' || token === 'undefined' || ~token.indexOf('\0')) {
            return next(new Error({ status: 401, message: socket.i18n.__('AUTH_ERR') })); // FIXME: emit error
        }

        // FIXME: проверить на срок действия токена
        let jwt_payload = jwt.verify(token, config.secret);

        (async () => {
            let denied = await BlackList.findOne({ token: token }).lean().exec();

            let user = await User.findOne({ _id: jwt_payload.user_id, active: true });

            if (denied || (jwt_payload.token_uuid !== user.token_uuid)) {
                return await next(new Error({ status: 401, message: socket.i18n.__('AUTH_ERR') }));
            }

            user.last_activity   = Date.now();
            user.last_ip_address = socket.request.ip;

            await user.save();

            socket.user = user;

            next();

        })()
    });

    io.of('/api').on('connection', socket => {

        let token = tokenFromSocket(socket);

        redisClient.sadd([ socketPrefix + String(socket.user._id), socket.id ]);
        redisClient.sadd([ socketPrefix + token, socket.id ]);


        socket.join(String(socket.user._id));
        socket.join(socket.user.role); // TODO: on signout leave, on change role leave
        socket.on('changeLocale', locale => { i18n.setLocale(locale); });

        socket.on('disconnect', () => {

            (async () => {
                try {
                    if (socket.user && socket.user._id) {
                        redisClient.srem([ socketPrefix + String(socket.user._id), socket.id ]);
                        redisClient.srem([ socketPrefix + token, socket.id ]);
                        // redisClient.del(socketPrefix + String(socket.user._id)); // REMOVE ALL
                        // redisClient.del(socketPrefix + token);                   // REMOVE ALL
                    }
                } catch (err) {
                    console.error('session clear error', err);
                }
            })();

        });
    });

    io.on('connection', socket => {
        let handshakeData = socket.request;
        const cookies     = new Cookies(handshakeData, {}, config.secret);
        let locale;

        if (cookies.get('locale')) {
            locale = cookies.get('locale');
        } else if (handshakeData.query && handshakeData.query.locale) {
            locale = handshakeData.query.locale;
        } else if (handshakeData._query && handshakeData._query.locale) {
            locale = handshakeData._query.locale;
        } else if (socket.handshake.headers['accept-language']) {
            locale = acceptLanguage.get(socket.handshake.headers['accept-language']);
        } else {
            locale = config.defaultLocale
        }

        i18n.setLocale(locale);

        socket.on('changeLocale', locale => { i18n.setLocale(locale); });

        socket.i18n = i18n;
    });

    return io;
}

// ALL USER IDS : Socket.socket_ids(token).then(ids...)
Object.defineProperty(Socket, 'socket_ids', {
    writable: false,
    configurable: false,
    value: function (token) {
        let userId = jwt.verify(token, config.secret)._id;
        return new Promise((resolve, reject) => {
            redisClient.smembers( socketPrefix + String(userId), (err, reply) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
            });
        });
    }
});

// USER TOKEN IDS (SESSION IDS) : Socket.session_ids(token).then(ids...)
Object.defineProperty(Socket, 'session_ids', {
    writable: false,
    configurable: false,
    value: function (token) {
        return new Promise((resolve, reject) => {
            redisClient.smembers( socketPrefix + token, (err, reply) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
            });
        });
    }
});

Socket.emitter = socketEmitter(redisClient);
Socket.emitter.redis.on('error', err => { console.error(err); });


/*          https://github.com/socketio/socket.io-emitter
Socket.emitter.emit('broadcast', ...);

// sending to all clients in 'game' room
Socket.emitter.to('game').emit('new-game', ... );

// sending to individual socketid (private message)
Socket.emitter.to(<socketid>).emit('private', ... );

let nsp = Socket.emitter.of('/admin');

// sending to all clients in 'admin' namespace
nsp.emit('namespace', ...);

// sending to all clients in 'admin' namespace and in 'notifications' room
nsp.to('notifications').emit('namespace',  ... );

---------------------------------------------------------------------------

//  ???
Socket.emitter.volatile.in('room').emit()
Socket.emitter.volatile.to('room').emit()
Socket.emitter.volatile.of('room').emit()

// Every sockets but the sender
Socket.emitter.broadcast.in('room').emit()
Socket.emitter.broadcast.to('room').emit()
Socket.emitter.broadcast.of('room').emit()

Socket.emitter.json.in('room').emit()
Socket.emitter.json.to('room').emit()
Socket.emitter.json.of('room').emit()

*/


module.exports = Socket;
