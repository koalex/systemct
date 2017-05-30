/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ==================================
 ===   Access Control via JWT   ===
 ==================================
 */

'use strict';

const config      = require('config');
const passport    = require('koa-passport');
const normalize   = require('path').normalize;
const jwt         = require('jsonwebtoken');
const BlackList   = require('../handlers/auth/models/blacklist');
const Socket      = require('../libs/socket');
const { USERS, ACTIVITY, _CREATE, _READ, _UPDATE, _DELETE, _SUCCESS, _ERROR } = require(config.actionsRoot);

passport.use('jwt', require('../handlers/auth/strategies/jwt'));

module.exports = async (ctx, next) => {
    let url = normalize(ctx.request.url);

    if (url.startsWith('/api') && !url.startsWith('/api/signin')) {

        await passport.authenticate('jwt', async (err, user, info, status) => {

            if (err) ctx.throw(err);
            if (!user) ctx.throw(401);
            if (info && info.name && info.name === 'TokenExpiredError') ctx.throw(401);

            let token  = ctx.request.body.access_token || ctx.query.access_token || ctx.headers['x-access-token'] || ctx.cookies.get('x-access-token');

            let denied = await BlackList.findOne({ token: token }).lean().exec();

            if (denied || (jwt.verify(token, config.secret).token_uuid !== user.token_uuid)) {
                ctx.throw(401);
                return;
            }

            user.last_activity   = Date.now();
            user.last_ip_address = ctx.request.ip;

            await user.save();

            config.roles.filter(role => role !== 'manager').forEach(role => {
                Socket.emitter.of('/api').to(role).emit(USERS + ACTIVITY + _UPDATE + _SUCCESS, user.toJSON());
            });

            ctx.state.user  = user;
            ctx.state.token = token;

            await next();

        })(ctx, next);

    } else {
        await next();
    }
};