/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
 /* 
   ================================
   ===       MODULE NAME       ====
   ================================ 
*/

'use strict';

const crypto    = require('crypto');
const moment    = require('moment');
const User      = require('../../user/models/user');
const mailer    = require('../../../libs/nodemailer');


exports.forgot = async ctx => {
    if (!/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(ctx.request.body.email)) ctx.throw(400);

    let user = await User.findOne({ email: ctx.request.body.email });

    if (!user){
        ctx.throw(400, 'USER_NOT_FOUND');
    } else {

        let token = await new Promise((resolve, reject) => {
            crypto.randomBytes(20, (err, buf) => {
                if (err) reject(err);
                resolve(buf.toString('hex'));
            });
        });

        user.password_reset_token      = token;
        user.password_reset_expiration = Date.now() + 3600000; // 1 hour

        await user.save();

        await mailer(null, user.email, ctx.i18n.__('password_change_mail.SUBJECT'), null, `<p>${ctx.i18n.__('password_change_mail.TEXT1')} <a href="http://${ctx.request.headers.host}/password_reset/${token}">${ctx.request.headers.host}/password_reset/${token}</a> ${ctx.i18n.__('password_change_mail.TEXT2')}</p>`);

        ctx.body = { message: ctx.i18n.__('password_change_mail.TEXT3') + user.email + ctx.i18n.__('password_change_mail.TEXT4') };

    }
};

exports.reset = async ctx => {
    let user = await User.findOne({ password_reset_token: ctx.params.reset_token });

    if (!user) ctx.throw(404);

    if (moment(user.password_reset_expiration).valueOf() - moment(Date.now()).valueOf() < 0) {
        ctx.throw(410, ctx.i18n.__('PASSWORD_RESET_ELAPSED'));
    } else {
        user.password                  = ctx.request.body.password;
        user.passwordConfirmation      = ctx.request.body.password;
        user.password_reset_token      = undefined;
        user.password_reset_expiration = undefined;

        await user.save();

        ctx.body = { message: ctx.i18n.__('PASSWORD_CHANGE_SUCCESS') };
    }
};