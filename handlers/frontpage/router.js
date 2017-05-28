/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===           ROUTER         ===
 ================================
 */

'use strict';

const Router = require('koa-router');
const router = new Router();

router.get('/', require('./controllers/frontpage'));

module.exports = router;