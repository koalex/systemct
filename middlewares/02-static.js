'use strict';

const serve         = require('koa-static');
const config        = require('config');
const path          = require('path');
const normalize     = path.normalize;

module.exports = async (ctx, next) => {
    let staticPath = config.publicRoot;
    let url        = normalize(ctx.request.url);

    if (url.startsWith(`${path.sep}swagger-ui`)) staticPath = path.join(config.projectRoot, './node_modules');
    if (url.startsWith(`${path.sep}files${path.sep}`)) staticPath = join(config.projectRoot, '../');

    return serve(staticPath, {
        maxage : __DEVELOPMENT__ ? 0 : 86400000*30,
        gzip: true,
        usePrecompiledGzip: true
    })(ctx, next);
};