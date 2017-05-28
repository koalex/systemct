/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

const BlackList   = require('../models/blacklist');
const User        = require('../../user/models/user');
const uuid        = require('uuid');

module.exports = async ctx => {
    let token = this.request.body.access_token || this.query.access_token || this.headers['x-access-token'] || this.cookies.get('x-access-token');

    let blackToken = new BlackList({ token: token });

    await blackToken.save();

    let user = await User.findOne({ _id: ctx.state.user._id });

    user.token_uuid = uuid();

    await user.save();

    ctx.state.user = null;

    ctx.set('x-access-token', null, { httpOnly: true });

    ctx.status = 204;
};
