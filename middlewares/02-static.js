'use strict';

const serve         = require('koa-static');
const config        = require('config');
const path          = require('path');
const join          = path.join;
const normalize     = path.normalize;

module.exports = async (ctx, next) => {
    let staticPath = config.publicRoot;
    let url        = normalize(ctx.request.url);

    if (url.startsWith(`${path.sep}swagger-ui`)) {
        staticPath = join(config.projectRoot, './node_modules');
    } else if (url.startsWith(`${path.sep}files${path.sep}`)) {
        staticPath = config.projectRoot;
    } else if (url.startsWith(`${path.sep}uploads${path.sep}`)) {
        staticPath = config.projectRoot;
    }

    return serve(staticPath, {
        maxage : __DEVELOPMENT__ ? 0 : 86400000*30,
        gzip: true,
        usePrecompiledGzip: true
    })(ctx, next);
};