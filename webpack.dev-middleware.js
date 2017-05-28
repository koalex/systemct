'use strict';

const webpack       = require('webpack');
const webpackConfig = require('./webpack.config');
const koaWebpack 	= require('koa-webpack');
const compiler      = webpack(webpackConfig);

compiler.plugin('done', () => {
    console.log('Clearing /client/ module cache from server');
    Object.keys(require.cache).forEach(id => { if (/[\/\\]client[\/\\]/.test(id)) delete require.cache[id]; });
});

module.exports = koaWebpack({
    compiler: compiler,
    config: webpackConfig,
    dev: {
        publicPath: webpackConfig.output.publicPath,
        // headers: { 'Content-Type': 'text/html; charset=utf-8' },
        stats: { colors: true },
        quiet: false,
        noInfo: true
    },
    hot: {
        log: console.log,
        path: '/__webpack_hmr',
        heartbeat: 10 * 1000
    }
});

