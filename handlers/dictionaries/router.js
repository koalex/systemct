/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ✰✰✰ ***/

/*
 ================================
 ===   DICTIONARIES ROUTER    ===
 ================================
 */

'use strict';

const Router        = require('koa-router');
const router        = new Router();
const Api           = new Router({ prefix: '/api/dictionaries' });

const ugo           = require('./controllers/ugo');
const sensor        = require('./controllers/sensor');
const device        = require('./controllers/device');


Api.post('/ugo',        ugo.create);
Api.get('/ugo',         ugo.read);
Api.get('/ugo/export',  ugo.export);
Api.post('/ugo/import',  ugo.imports);
Api.get('/ugo/:id',     ugo.read);
Api.put('/ugo/:id',     ugo.update);
Api.del('/ugo/:id',     ugo.delete);

Api.post('/sensors',        sensor.create);
Api.get('/sensors',         sensor.read);
Api.get('/sensors/export',  sensor.export);
Api.post('/sensors/import',  sensor.imports);
Api.get('/sensors/:id',     sensor.read);
Api.put('/sensors/:id',     sensor.update);
Api.del('/sensors/:id',     sensor.delete);

Api.post('/devices',        device.create);
Api.get('/devices',         device.read);
Api.get('/devices/export',  device.export);
Api.post('/devices/import',  device.imports);
Api.get('/devices/:id',     device.read);
Api.put('/devices/:id',     device.update);
Api.del('/devices/:id',     device.delete);


router.use(Api.routes());

module.exports = router;