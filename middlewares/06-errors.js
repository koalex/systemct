/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===   GLOBAL ERR HANDLER     ===
 ================================
 */

'use strict';

const normalize = require('path').normalize;

function validationErr (err) {
    let msgs = [];

    for (let k in err.errors) {
        let msg = {
            field: (err.errors[k].properties && err.errors[k].properties.path) ? err.errors[k].properties.path : k,
            message: (err.errors[k].properties && err.errors[k].properties.message) ? err.errors[k].properties.message : err.errors[k].message ? err.errors[k].message :  err.errors[k]
        };

        if (!Array.isArray(msg.message) && ~msg.message.indexOf('unique')) msg.message = 'VAL_NOT_UNIQUE';

        msgs.push(msg);
    }

    return (msgs.length === 1 ? msgs[0] : msgs);
}

module.exports = async (ctx, next) => {

    try {

        await next();

        if (ctx.response && ctx.response.status && ctx.response.status == 404 && !~ctx.request.url.indexOf('hot-update.json')) {
            ctx.throw(404);
        }

    } catch (err) {

        if (__DEVELOPMENT__) console.error(err);

        if (err.errorType) { // Browser error

            let report = {
                status: err.status,
                agent: err.agent,
                url: err.url,
                file: err.file,
                line: err.line,
                column: err.column,
                stack: err.stack,
                errorType: err.errorType,
                message: err.message,
                originalMessage: err.originalMessage,
                referer: ctx.get('referer'),
                cookie: ctx.get('cookie')
            };

            ctx.log.error(report);

        } else {
            let report = {
                status: err.status,
                message: err.message,
                stack: err.stack,
                url: ctx.request.url,
                referer: ctx.get('referer'),
                cookie: ctx.get('cookie')
            };

            if (!err.expose) report.requestVerbose = ctx.request; // dev error

            ctx.log.error(report);
        }

        let preferredType = ctx.accepts('html', 'json');
        let url           = normalize(ctx.request.url);

        if (url.startsWith('/api')) preferredType = 'json';

        let message;

        if (Array.isArray(err.message)) message = 'BAD REQUEST'; // TODO: MONGODB NATIVE VALIDATOR

        if (err.name === 'ValidationError' || err.name === 'ValidatorError') {
            message = validationErr(err, Object.keys(err.errors), ctx)
        } else if (err.message == 'Missing credentials') {
            message = 'MISSING_CREDENTIALS'
        } else if (err.name === 'AccessControlError') {
            message = 'BAD REQUEST';
        }else {
            message = err.message;
        }

        if (typeof message === 'string') {
            if (message.toUpperCase() === 'NOT FOUND') message = 'NOT_FOUND';
            if (message.toUpperCase() === 'BAD REQUEST') message = 'BAD_REQUEST';
            if (message.toUpperCase() === 'FORBIDDEN') message = 'FORBIDDEN';
            if (message.toUpperCase() === 'UNAUTHORIZED') message = 'AUTH_ERR';
        }

        ctx.status = err.name === 'ValidationError' || err.name === 'ValidatorError' ? 400 : err.status ? err.status : err.statusCode ? err.statusCode : 500;

        if (!__DEVELOPMENT__) {
            if (ctx.status >= 500) {
                ctx.status = 500;
                message = 'SERVER_ERROR';
            }
        }

        let response;

        if (Array.isArray(message)) {
            response = message.map(msg => {
                if (msg.message) msg.message = ctx.i18n.__(msg.message);
                return msg;
            })
        } else if (message.message && !Array.isArray(message.message)) {
            message.message = ctx.i18n.__(message.message);
            response = message;
        } else {
            response = { message: ctx.i18n.__(message) }
        }

        if (preferredType === 'json') {
            if (err.code === 11000) err.status = 409;

            ctx.body = response;

            if (err.description) ctx.body.description = err.description;
        } else {
            // may be error if headers are already sent...
            ctx.set('X-Content-Type-Options', 'nosniff');

            // ctx.status = err.expose ? err.status : 500;

            ctx.status = err.name === 'ValidationError' || err.name === 'ValidatorError' ? 400 : err.status ? err.status : err.statusCode ? err.statusCode : 500;

            if (!__DEVELOPMENT__) {
                if (ctx.status >= 500) {
                    ctx.status = 500;
                    message = 'SERVER_ERROR';
                }
            }

            return ctx.render('error', {
                status: ctx.status,
                message: typeof message === 'string' ? ctx.i18n.__(message) : ctx.i18n.__('SERVER_ERROR'),
                GO_2_HOME_PAGE: ctx.i18n.__('GO_2_HOME_PAGE')
            });
        }

    }

};
