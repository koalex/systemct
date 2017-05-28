/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===   LOGGER WITH CONTEXT    ===
 ================================
*/

'use strict';


const CLS = require('continuation-local-storage');

module.exports = async (ctx, next) => {
    const ns = CLS.getNamespace('app');

    ctx.log = ns.get('logger');

    ns.set('logger', ctx.log);

    await next();
};