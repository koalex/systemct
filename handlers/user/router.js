/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ✰✰✰ ***/

/*
 ================================
 ===        USER ROUTER       ===
 ================================
*/

'use strict';

const Router        = require('koa-router');
const router        = new Router();
const Api           = new Router({ prefix: '/api' });
const users         = require('./controllers/users');

Api.get('/me',                        users.getMe);
Api.get('/users',                     users.getAll);
Api.get('/users/:id',                 users.getOne);
Api.post('/users',                    users.create);
Api.put('/users/:id',                 users.update);
Api.del('/users/:id',                 users.delete);

router.get('/__INIT__', users.__INIT__);
router.use(Api.routes());

module.exports = router;

// module.exports.socket = [users.socketCreate, users.socketUpdate];
// module.exports.socket = socket => {
//     socket.on(USERS + _CREATE, data => {
//         if (!data || !data.user || !data.user.role || config.roles.every(role => role !== data.user.role)) {
//             socket.emit(USERS + _CREATE + _ERROR, { status: 400, message: socket.i18n.__('BAD_REQUEST') });
//             return;
//         }
//
//         const permission = abac.can(socket.user.role).createAny(data.user.role || ' ');
//
//         if (permission.granted) {
//
//             data.user.immortal         = false;
//             data.user.created_by       = socket.user._id;
//             data.user.created_at       = Date.now();
//             data.user.last_updated_by  = socket.user._id;
//             data.user.last_updated_at  = Date.now();
//
//             let newUser = new User(data.user);
//
//             newUser.save().then(() => {
//                 // Socket.emitter.to('superuser').emit('USER_SUBMIT_SUCCESS', newUser);
//                 // Socket.emitter.to('admin').emit('USER_SUBMIT_SUCCESS', newUser);
//                 socket.emit(USERS + _CREATE + _SUCCESS, newUser);
//             }).catch(err => {
//                 if (err.errors) {
//                     for (let errKey in err.errors) {
//                         let message = err.errors[errKey].message;
//                         if (message) message = message.split(',')[0];
//                         let field = err.errors[errKey].path;
//
//                         socket.emit(USERS + _CREATE + _ERROR, { status: err.status || err.statusCode, field: field ? field : null, message: socket.i18n.__(message || err.message) });
//                     }
//                 } else {
//                     socket.emit(USERS + _CREATE + _ERROR, { status: err.status || err.statusCode, message: socket.i18n.__('BAD_REQUEST' /*err.message*/) });
//                 }
//             });
//         } else {
//             socket.emit(USERS + _CREATE + _ERROR, { status: 403, message: socket.i18n.__('FORBIDDEN') });
//         }
//     });
// };