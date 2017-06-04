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


Api.post('/ugo',    ugo.create);
Api.get('/ugo',     ugo.read);
Api.get('/ugo/:id', ugo.read);
Api.put('/ugo/:id', ugo.update);
Api.del('/ugo/:id', ugo.delete);

Api.post('/sensor',    sensor.create);
Api.get('/sensor',     sensor.read);
Api.get('/sensor/:id', sensor.read);
Api.put('/sensor/:id', sensor.update);
Api.del('/sensor/:id', sensor.delete);

Api.post('/device',    device.create);
Api.get('/device',     device.read);
Api.get('/device/:id', device.read);
Api.put('/device/:id', device.update);
Api.del('/device/:id', device.delete);


router.use(Api.routes());

module.exports = router;