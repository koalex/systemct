/*
 /!*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***!/
 /!*
 ================================
 ===       MODULE NAME       ====
 ================================
 *!/

 'use strict';

 const config        = require('config');
 const passport      = require('koa-passport');
 const jwt           = require('jsonwebtoken');

 passport.use('local', require('../strategies/local'));

 module.exports = async ctx => {
 // ctx.type = 'json';

 await new Promise(resolve => { setTimeout(resolve, 200) }); // Anti-brutforce

 await passport.authenticate('local', async (err, user, info, status) => {

 if (err) ctx.throw(err);

 if (!user) ctx.throw(400, info ? info.message ? info.message : null : null);

 ctx.state.user = user;

 let token = jwt.sign({ user_id: user._id, token_uuid: user.token_uuid }, config.secret, { expiresIn: '30 days' });

 user.last_activity   = Date.now();
 user.last_ip_address = ctx.request.ip;

 await user.save();

 // ctx.cookies.set('x-access-token', token, { httpOnly: true });

 console.log('ctx.response.status2', ctx.response.status)

 ctx.body = { access_token: token, user_id: user._id };

 })(ctx);
 };

 module.exports.socketAuthentication = require('../strategies/socketio');*/


/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

const config        = require('config');
const passport      = require('koa-passport');
const jwt           = require('jsonwebtoken');

passport.use('local', require('../strategies/local'));

module.exports = async ctx => {

    await new Promise(resolve => { setTimeout(resolve, 200) }); // Anti-brutforce

    ctx.body = '123'

};

// module.exports.socketAuthentication = require('../strategies/socketio');