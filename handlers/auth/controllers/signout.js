/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

const BlackList   = require('../models/blacklist');

module.exports = async ctx => {
    ctx.state.user = null;

    let token = ctx.request.body.access_token || ctx.query.access_token || ctx.headers['x-access-token'] || ctx.cookies.get('x-access-token');

    let blackToken = new BlackList({ token: token });

    await blackToken.save();

    ctx.status = 204;
};
