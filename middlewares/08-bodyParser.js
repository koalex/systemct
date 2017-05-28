/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===        BODY PARSE        ===
 ================================
*/

'use strict';

const koaBodyParser = require('koa-bodyparser'); // application/json , application/x-www-form-urlencoded ONLY

module.exports = koaBodyParser({
    formLimit: '3mb',
    jsonLimit: '3mb'
});