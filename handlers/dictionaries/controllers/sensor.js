/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

const fs            = require('fs');
const tar           = require('tar-fs')
const path          = require('path');
const basename      = path.basename;
const extname       = path.extname;
const join          = path.join;
const config        = require('config');
const archiver      = require('archiver');
const Sensor        = require('../models/sensor');
const AccessControl = require('accesscontrol');
const abac          = new AccessControl(/*grants*/);
const Socket        = require('../../../libs/socket');

const { DICTIONARY, UGO, SENSOR, MODAL, _CREATE, _READ, _UPDATE, _DELETE, _IMPORT, _EXPORT, _SUCCESS, _ERROR, _HIDE } = require(config.actionsRoot);

abac.grant('superuser')
    .createAny('sensor')
    .readAny('sensor')
    .updateAny('sensor')
    .deleteAny('sensor');

abac.grant('admin')
    .createAny('sensor')
    .readAny('sensor')
    .updateAny('sensor')
    .deleteAny('sensor');

abac.grant('manager')
    .readAny('sensor');

exports.export = async ctx => {
    const permission = abac.can(ctx.state.user.role).readAny('sensor');

    if (permission.granted) {
        let sensor = await Sensor.find().lean().exec();

        if (!sensor.length) {
            ctx.throw(404, 'DICTIONARY_EMPTY');
            return;
        }

        let archive = archiver('tar', { zlib: { level: 9 } });

        archive.on('error', err => { ctx.throw(500, err); });

        // archive.pipe(ReadableStream...);

        archive.append(JSON.stringify(sensor), { name: 'sensors.json' });

        if (sensor.length) {
            sensor.forEach(sensorItem => {
                if (sensorItem.img) archive.append(fs.createReadStream( join(config.projectRoot, sensorItem.img) ), { name: basename(sensorItem.img) })
            })
        }

        archive.finalize();

        ctx.type = 'application/gzip';

        ctx.body = archive;
    }
};

exports.imports = async ctx => {
    const permission = abac.can(ctx.state.user.role).createAny('sensor');

    if (!permission.granted) {
        ctx.throw(403);
        return;
    }

    const { files, fields } = await ctx.multipartParser.parse(ctx);

    if (!files || !Array.isArray(files) || !files.length || extname(files[0].filename) !== '.tar') {
        ctx.throw(400);
    }

    let sensorDataPath;
    // TODO: check mime-type && clean extracted if no .json
    files[0].pipe(tar.extract(config.filesRoot, {
        mapStream: function (fileStream, header) {
            if (extname(header.name) === '.json') {
                sensorDataPath = join(config.filesRoot, header.name);
            }

            return fileStream;
        }
    }));

    let sensors = await new Promise((resolve, reject) => {
        files[0].on('end', () => {
            setTimeout(() => {
                if (!sensorDataPath) {
                    resolve(null);
                } else {
                    let sensors = require(sensorDataPath);
                    resolve(sensors);
                }
            }, 1000)
        })
    });

    if (!sensors) {
        ctx.throw(400);
    } else {
        await fs.unlink(sensorDataPath);

        for (let i = 0, l = sensors.length; i < l; i++) {
            delete sensors[i]._id;
            delete sensors[i].id;

            let newSensor                  = new Sensor(sensors[i]);
                newSensor.last_updated_by  = ctx.state.user._id;
            try {
                await newSensor.save();
            } catch (err) {
                ctx.throw(400);
                return;
            }
        }

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + SENSOR + _IMPORT + _SUCCESS);
        });

        ctx.type = 'json';

        ctx.status = 204;
    }
};

exports.create = async ctx => {
    const permission = abac.can(ctx.state.user.role).createAny('sensor');

    let sensorCandidate = ctx.request.body;

    if (permission.granted) {

        let newSensor                  = new Sensor(sensorCandidate);
            newSensor.last_updated_by  = ctx.state.user._id;

        if (ctx.request.body.files) newSensor.img = ctx.request.body.files[0];

        await newSensor.save();

        newSensor = newSensor.toJSON();

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + SENSOR + _CREATE + _SUCCESS, newSensor);
        });

        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(SENSOR + MODAL + _HIDE);
            });

        ctx.status = 201;
        ctx.body   = { _id: newSensor._id };

    } else {
        ctx.throw(403);
    }
};

exports.read = async ctx => {
    const permission = abac.can(ctx.state.user.role).readAny('sensor');

    if (permission.granted) {
        ctx.body = await Sensor.find().sort('title').lean().exec();
    } else {
        ctx.throw(403);
    }
};

exports.update = async ctx => {
    let sensorCandidate = ctx.request.body;

    const permission = abac.can(ctx.state.user.role).updateAny('sensor');

    if (permission.granted) {
        if (!sensorCandidate) ctx.throw(400);

        sensorCandidate.last_updated_by   = ctx.state.user._id;
        sensorCandidate.last_updated_at   = Date.now();

        delete sensorCandidate.created_at;
        delete sensorCandidate.created_by;

        let sensor = await Sensor.findOne({ _id: ctx.params.id });

        if (!sensor) ctx.throw(400);

        for (let k in sensorCandidate) {
            sensor[k] = sensorCandidate[k];
        }

        if (Array.isArray(ctx.request.body.files) && ctx.request.body.files[0]) sensor.img = ctx.request.body.files[0];

        await sensor.save();

        // await Sensor.update({ _id: ctx.params.id, role: sensorCandidate.role }, { $set: sensorCandidate });

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + SENSOR + _UPDATE + _SUCCESS, sensor.toJSON());
        });
        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(SENSOR + MODAL + _HIDE);
            });

        ctx.type = 'json';

        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};

exports.delete = async ctx => {
    const permission = abac.can(ctx.state.user.role).deleteAny('sensor');

    if (permission.granted) {
        await Sensor.remove({ _id: ctx.params.id });

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + SENSOR + _DELETE + _SUCCESS, { _id: ctx.params.id });
        });

        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};