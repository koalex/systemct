/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
 /* 
   ================================
   ===       MODULE NAME       ====
   ================================ 
*/

'use strict';

const User      = require('../../user/models/user');
const mailer    = require('../../../libs/nodemailer');

exports.email = async ctx => {
    let user = await User.findOne({ active: false, email_confirmation_token: ctx.request.body.email });

    if (!user){
        ctx.throw(404);
    } else {

        user.email_confirmation_token  = undefined;

        await user.save();

        await mailer(null, user.email, ctx.i18n.__('password_change_mail.SUBJECT'), null, `<p>${ctx.i18n.__('password_change_mail.TEXT1')} <a href="http://${ctx.request.headers.host}/password_reset/${token}">${ctx.request.headers.host}/password_reset/${token}</a> ${ctx.i18n.__('password_change_mail.TEXT2')}</p>`);

        ctx.body = { message: ctx.i18n.__('password_change_mail.TEXT3') + user.email + ctx.i18n.__('password_change_mail.TEXT4') };

    }
};

/*
exports.email = async ctx => {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    let user = await User.findOne({ active: false, email: ctx.request.body.email });

    if (!user){
        ctx.throw(400, ctx.i18n.__('USER_NOT_FOUND'));
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
};*/
