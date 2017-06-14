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
const Device        = require('../models/device');
const AccessControl = require('accesscontrol');
const abac          = new AccessControl(/*grants*/);
const Socket        = require('../../../libs/socket');

const { DICTIONARY, UGO, SENSOR, DEVICE, MODAL, _CREATE, _READ, _UPDATE, _DELETE, _IMPORT, _EXPORT, _SUCCESS, _ERROR, _HIDE } = require(config.actionsRoot);

abac.grant('superuser')
    .createAny('device')
    .readAny('device')
    .updateAny('device')
    .deleteAny('device');

abac.grant('admin')
    .createAny('device')
    .readAny('device')
    .updateAny('device')
    .deleteAny('device');

abac.grant('manager')
    .readAny('device');

exports.export = async ctx => {
    const permission = abac.can(ctx.state.user.role).readAny('device');

    if (permission.granted) {
        let devices = await Device.find().lean().exec();

        if (!devices.length) {
            ctx.throw(404, 'DICTIONARY_EMPTY');
            return;
        }

        let archive = archiver('tar', { zlib: { level: 9 } });

        archive.on('error', err => { ctx.throw(500, err); });

        // archive.pipe(ReadableStream...);

        archive.append(JSON.stringify(devices), { name: 'devices.json' });

        if (devices.length) {
            devices.forEach(device => {
                if (device.img) archive.append(fs.createReadStream( join(config.projectRoot, device.img) ), { name: basename(device.img) })
            })
        }

        archive.finalize();

        ctx.type = 'application/gzip';

        ctx.body = archive;
    }
};

exports.imports = async ctx => {
    const permission = abac.can(ctx.state.user.role).createAny('device');

    if (!permission.granted) {
        ctx.throw(403);
        return;
    }

    const { files, fields } = await ctx.multipartParser.parse(ctx);

    if (!files || !Array.isArray(files) || !files.length || extname(files[0].filename) !== '.tar') {
        ctx.throw(400);
    }

    let devicesDataPath;
    // TODO: check mime-type && clean extracted if no .json
    files[0].pipe(tar.extract(config.filesRoot, {
        mapStream: function (fileStream, header) {
            if (extname(header.name) === '.json') {
                devicesDataPath = join(config.filesRoot, header.name);
            }

            return fileStream;
        }
    }));

    let devices = await new Promise((resolve, reject) => {
        files[0].on('end', () => {
            setTimeout(() => {
                if (!devicesDataPath) {
                    resolve(null);
                } else {
                    let devices = require(devicesDataPath);
                    resolve(devices);
                }
            }, 1000)
        })
    });

    if (!devices) {
        ctx.throw(400);
    } else {
        await fs.unlink(devicesDataPath);

        for (let i = 0, l = devices.length; i < l; i++) {
            delete devices[i]._id;
            delete devices[i].id;

            let newDevice                  = new Device(devices[i]);
                newDevice.last_updated_by  = ctx.state.user._id;
            try {
                await newDevice.save();
            } catch (err) {
                ctx.throw(400);
                return;
            }
        }

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + DEVICE + _IMPORT + _SUCCESS);
        });

        ctx.type = 'json';

        ctx.status = 204;
    }
};

exports.create = async ctx => {
    const permission = abac.can(ctx.state.user.role).createAny('device');

    let deviceCandidate = ctx.request.body;

    if (permission.granted) {

        let newDevice                  = new Device(deviceCandidate);
            newDevice.last_updated_by  = ctx.state.user._id;

        if (ctx.request.body.files) newDevice.img = ctx.request.body.files[0];

        await newDevice.save();

        newDevice = newDevice.toJSON();

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + DEVICE + _CREATE + _SUCCESS, newDevice);
        });

        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(DEVICE + MODAL + _HIDE);
            });

        ctx.status = 201;
        ctx.body   = { _id: newDevice._id };

    } else {
        ctx.throw(403);
    }
};

exports.read = async ctx => {
    const permission = abac.can(ctx.state.user.role).readAny('device');

    if (permission.granted) {
        ctx.body = await Device.find().sort('title').lean().exec();
    } else {
        ctx.throw(403);
    }
};

exports.update = async ctx => {
    let deviceCandidate = ctx.request.body.body || ctx.request.body;

    const permission = abac.can(ctx.state.user.role).updateAny('device');

    if (permission.granted) {
        if (!deviceCandidate) ctx.throw(400);

        deviceCandidate.last_updated_by   = ctx.state.user._id;
        deviceCandidate.last_updated_at   = Date.now();

        delete deviceCandidate.created_at;
        delete deviceCandidate.created_by;

        let device = await Device.findOne({ _id: ctx.params.id });

        if (!device) ctx.throw(400);

        for (let k in deviceCandidate) {
            device[k] = deviceCandidate[k];
            if (!device[k]) device[k] = deviceCandidate[k];
        }

        if (Array.isArray(ctx.request.body.files) && ctx.request.body.files[0]) device.img = ctx.request.body.files[0];

        await device.save();

        // await Sensor.update({ _id: ctx.params.id, role: deviceCandidate.role }, { $set: deviceCandidate });

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + DEVICE + _UPDATE + _SUCCESS, device.toJSON());
        });
        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(DEVICE + MODAL + _HIDE);
            });

        ctx.type = 'json';

        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};

exports.delete = async ctx => {
    const permission = abac.can(ctx.state.user.role).deleteAny('device');

    if (permission.granted) {
        await Device.remove({ _id: ctx.params.id });

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + DEVICE + _DELETE + _SUCCESS, { _id: ctx.params.id });
        });

        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(DEVICE + MODAL + _HIDE);
            });

        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};