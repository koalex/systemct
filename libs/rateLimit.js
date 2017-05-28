/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
 /* 
   ================================
   ===       MODULE NAME       ====
   ================================ 
*/

'use strict';


/**
 * Module dependencies.
 */

const Limiter   = require('ratelimiter');
const ms        = require('ms');
const thenify   = require('thenify');

/**
 * Expose `ratelimit()`.
 */


module.exports = opts => {
    opts                    = opts || {};
    opts.headers            = opts.headers || {};
    opts.headers.remaining  = opts.headers.remaining || 'X-RateLimit-Remaining';
    opts.headers.reset      = opts.headers.reset || 'X-RateLimit-Reset';
    opts.headers.total      = opts.headers.total || 'X-RateLimit-Limit';

    return async (ctx, next) => {
        let id = opts.id ? opts.id(ctx) : ctx.ip;

        if (false === id) return await next();

        // initialize limiter
        let limiter = new Limiter({ id: id, __proto__: opts });
        limiter.get = thenify(limiter.get);

        // check limit
        let limit = await limiter.get();

        // check if current call is legit
        let remaining = limit.remaining > 0 ? limit.remaining - 1 : 0;

        // header fields
        let headers = {};
        headers[opts.headers.remaining] = remaining;
        headers[opts.headers.reset]     = limit.reset;
        headers[opts.headers.total]     = limit.total;

        ctx.set(headers);

        debug('remaining %s/%s %s', remaining, limit.total, id);
        if (limit.remaining) return await next();

        let delta = (limit.reset * 1000) - Date.now() | 0;
        let after = limit.reset - (Date.now() / 1000) | 0;
        ctx.set('Retry-After', after);

        ctx.status = 429;
        ctx.body   = opts.errorMessage || 'Rate limit exceeded, retry in ' + ms(delta, { long: true }) + '.';

        if (opts.throw) ctx.throw(ctx.status, ctx.body, { headers: headers });
    }
};