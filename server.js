/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===          SERVER          ===
 ================================
 */

'use strict';

global.__DEVELOPMENT__ = process.env.NODE_ENV === 'development';
global.__DEBUG__       = process.env.NODE_ENV === 'debug' || process.env.NODE_ENV === 'debugging';

const semver = require('semver');
if (semver.lt(semver.clean(process.versions.node), '7.9.0') || parseFloat(process.versions.v8) < 5.4) {
	/* jshint -W101 */
	console.log('\n*********************************************\n* Для запуска требуется Node.js v7.9 и выше *\n* Для запуска требуется V8 v5.4 и выше      *\n* Пожалуйста обновитесь.                    *\n*********************************************\n');
	process.exit();
}
const koa           = require('koa');
const app           = new koa();
const helmet        = require('koa-helmet');
const Router        = require('koa-router');
const config        = require('config');
const locale        = require('koa-locale');
const i18n          = require('koa-i18n');
const bunyan        = require('bunyan');
const devLogger     = require('koa-logger');
const CLS           = require('continuation-local-storage');
const ns            = CLS.createNamespace('app');
const uuid          = require('uuid');
const responseTime  = require('koa-response-time');
const conditional   = require('koa-conditional-get');
const etag          = require('koa-etag');
const compose       = require('koa-compose');
const userAgent     = require('koa-useragent');
const fs            = require('fs');
const path          = require('path');
const join          = path.join;
const chokidar      = require('chokidar');
const pkg         	= require(join(config.projectRoot, 'package.json'));

require('events').EventEmitter.defaultMaxListeners = Infinity;

app.keys = [config.secret];

if (process.env.TRACE) require('./libs/trace')();

if (__DEVELOPMENT__) {
	app.use(responseTime());
	app.use(devLogger());

	if (!process.env.NODEMON) {
		// TODO:...
	}
	const watcher = chokidar.watch(['./handlers', './middlewares', './libs', './modules']);

	watcher.on('ready', () => {
		watcher.on('all', () => {
			console.log('Clearing /handlers/ module cache from server');
			Object.keys(require.cache).forEach(id => {
				if (/[\/\\]handlers[\/\\]/.test(id)) {
					console.log('delete from require.cache', id);
					delete require.cache[id];
				}
			});
		});
	});
} else {
	app.use(helmet())
}

app.use(conditional());
app.use(etag());

locale(app);

app.use(i18n(app, {
	directory: './i18n',
	locales: ['ru', 'en'], //  `ru` defualtLocale, must match the locales to the filenames
	extension: '.json',
	defaultLocale: config.defaultLocale,
	//We can change position of the elements in the modes array. If one mode is detected, no continue to detect.
	modes: [
		'query',                //  optional detect querystring - `/?locale=en-US`
		'cookie',               //  optional detect cookie      - `Cookie: locale=zh-TW`
		'subdomain',            //  optional detect subdomain   - `zh-CN.koajs.com`
		'header',               //  optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
		'url',                  //  optional detect url         - `/en`
		'tld'                   //  optional detect tld(the last domain) - `koajs.cn`
		//function() {}         //  optional custom function (will be bound to the koa context)
	]
}));

app.use(async (ctx, next) => {
	ctx.i18n.locale =  ctx.getLocaleFromCookie()
		|| ctx.getLocaleFromHeader()
		|| ctx.getLocaleFromQuery();

	ctx.i18n.locale = ctx.i18n.locale ? ctx.i18n.locale.slice(0,2).toLowerCase() : config.defaultLocale;

	await next();
});

app.use(userAgent);

let log = bunyan.createLogger({
	name: 'SYSTEMCT',
	requestId: uuid.v1(),
	streams: [
		{
			level: 'error',
			path: join(config.projectRoot, './logs/errors.log')
		}
	]
});

process.on('unhandledRejection', err => {
	if (__DEVELOPMENT__) console.error(err);
	log.error(err);
});

app.use(async (ctx, next) => {
	let context = ns.createContext();
	ns.enter(context);
	ns.bindEmitter(ctx.req);
	ns.bindEmitter(ctx.res);
	try {

		ns.set('locale', ctx.i18n.getLocale());
		ns.set('logger', log);

		await next();

	} finally {

		if(ns.get('logger').requestId != log.requestId) {
			console.error('CLS: wrong context', ns.get('logger').requestId, 'should be', ctx.log.requestId);
		}
		ns.exit(context);
	}
});


const session = require('koa-session');

const CONFIG = {
	key: 'test:koa:sess', /** (string) cookie key (default is koa:sess) */
	maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
	overwrite: true, /** (boolean) can overwrite or not (default true) */
	httpOnly: true, /** (boolean) httpOnly or not (default true) */
	signed: true, /** (boolean) signed or not (default true) */
};




app.use(session(CONFIG, app));



/**
 DEFAULT MIDDLEWARES
 **/
// TODO: hot reloading for MIDDLEWARES but webpackMW
const middlewares = [];

fs.readdirSync(join(__dirname, 'middlewares'))
	.forEach(middleware => { middlewares.push(require(`./middlewares/${middleware}`)); });

app.use(compose(middlewares));

app.use(async (ctx, next) => {
	ctx.log = ns.get('logger');
	await next();
});

/**
 ROUTES
 **/
const router = new Router();
	  router.post('/error', async ctx => { ctx.throw(0, ctx.request.body); });

app.use(router.routes());

const Routes = () => {
	let routes = [];
	let stats = fs.readdirSync(`${config.projectRoot}/handlers`);
	stats.forEach(stat => {
		if (fs.lstatSync(`${config.projectRoot}/handlers/${stat}`).isDirectory()) {
			routes.push(`${config.projectRoot}/handlers/${stat}/router.js`);
		}
	});

	return routes;
};

Routes().forEach(route => { app.use(async (ctx, next) => require(route).routes()(ctx, next)); });

if (__DEVELOPMENT__) app.use(require('./webpack.dev-middleware'));

app.use(async ctx => {
	if (ctx.status == 404) {
		ctx.render('index', {
			PAGE_TTILE: ctx.i18n.__('frontpage.PAGE_TITLE'),
			APP_DESCRIPTION: ctx.i18n.__('frontpage.APP_DESCRIPTION'),
			COPYRIGHT: ctx.i18n.__('frontpage.COPYRIGHT'),
			CITY: ctx.i18n.__('frontpage.CITY'),
			COUNTRY: ctx.i18n.__('frontpage.COUNTRY'),
			STREET_ADDRESS: ctx.i18n.__('frontpage.STREET_ADDRESS'), // Карла Маркса 7
			PLACENAME: ctx.i18n.__('frontpage.PLACENAME'), // город Новосибирск, Россия
			REGION: ctx.i18n.__('frontpage.REGION'), // RU-город Новосибирск
			author: pkg.author.name,
			homepage: pkg.homepage,
			appName: pkg.name,

		});
	}
});

const socket = require('./libs/socket.js');
const server = app.listen(config.port);
console.log('SERVER LISTENING ON PORT:', config.port);
const io = socket(server);
// socket.io = io;

/* jshint -W064 */
/*Routes().forEach(route => {
	let routing = require(route);
	if (routing.socket) {
		if (Array.isArray(routing.socket)) {
			routing.socket.forEach(r => {
				r(socket);
			});
		} else {
			routing.socket(socket);
		}
	}
});*/

module.exports = server;