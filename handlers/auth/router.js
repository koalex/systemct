/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===           ROUTER         ===
 ================================
 */

'use strict';

const Router = require('koa-router');
const Api    = new Router({ prefix: '/api' });
const router = new Router();

router.post('/signin',   require('./controllers/signin'));
Api.post('/signin',      require('./controllers/signin')); // for swagger base-url
Api.post('/signout',     require('./controllers/signout'));
Api.get('/signout',      require('./controllers/signout'));
Api.post('/signout_all', require('./controllers/signout_all'));
Api.get('/signout_all',  require('./controllers/signout_all'));

router.post('/email_verification',           require('./controllers/verification').email);
router.post('/password_forgot',              require('./controllers/password_reset').forgot);
router.post('/password_reset/:reset_token',  require('./controllers/password_reset').reset);

router.use(Api.routes());

module.exports = router;

module.exports.socket = require('./controllers/signin').socketAuthentication;