/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

const fs            = require('fs');
const zlib          = require('zlib');
const tar           = require('tar-fs')
const path          = require('path');
const basename      = path.basename;
const extname       = path.extname;
const join          = path.join;
const config        = require('config');
const archiver      = require('archiver');
const Ugo           = require('../models/ugo');
const AccessControl = require('accesscontrol');
const abac          = new AccessControl(/*grants*/);
const Socket        = require('../../../libs/socket');

const { DICTIONARY, UGO, MODAL, _CREATE, _READ, _UPDATE, _DELETE, _IMPORT, _EXPORT, _SUCCESS, _ERROR, _HIDE } = require(config.actionsRoot);

abac.grant('superuser')
    .createAny('ugo')
    .readAny('ugo')
    .updateAny('ugo')
    .deleteAny('ugo');

abac.grant('admin')
    .createAny('ugo')
    .readAny('ugo')
    .updateAny('ugo')
    .deleteAny('ugo');

abac.grant('manager')
    .readAny('ugo');

exports.export = async ctx => {
    const permission = abac.can(ctx.state.user.role).readAny('ugo');

    if (permission.granted) {
        let ugo = await Ugo.find().lean().exec();

        if (!ugo.length) {
            ctx.throw(404, 'DICTIONARY_EMPTY');
            return;
        }

        let archive = archiver('tar', { zlib: { level: 9 } });

        archive.on('error', err => { ctx.throw(500, err); });

        // archive.pipe(ReadableStream...);

        archive.append(JSON.stringify(ugo), { name: 'ugo.json' });

        if (ugo.length) {
            ugo.forEach(ugoItem => {
                if (ugoItem.img) archive.append(fs.createReadStream( join(config.projectRoot, ugoItem.img) ), { name: basename(ugoItem.img) })
            })
        }

        archive.finalize();

        ctx.type = 'application/gzip';

        ctx.body = archive;
    }
};

exports.imports = async ctx => {
    const permission = abac.can(ctx.state.user.role).createAny('ugo');

    if (!permission.granted) {
        ctx.throw(403);
        return;
    }

    const { files, fields } = await ctx.multipartParser.parse(ctx);

    if (!files || !Array.isArray(files) || !files.length) {
        ctx.throw(400);
    }

    let ugoDataPath;
    // TODO: check mime-type && clean extracted if no .json
    files[0].pipe(tar.extract(config.filesRoot, {
        mapStream: function (fileStream, header) {
            if (extname(header.name) === '.json') {
                ugoDataPath = join(config.filesRoot, header.name);
            }

            return fileStream;
        }
    }));

    let ugos = await new Promise((resolve, reject) => {
        files[0].on('end', () => {
            if (!ugoDataPath) {
                resolve(null);
            } else {
                let ugos = require(ugoDataPath);
                resolve(ugos);
            }
        })
    });

    if (!ugos) {
        ctx.throw(400);
    } else {
        await fs.unlink(ugoDataPath);

        for (let i = 0, l = ugos.length; i < l; i++) {
            delete ugos[i]._id;
            delete ugos[i].id;

            let newUGO                  = new Ugo(ugos[i]);
                newUGO.last_updated_by  = ctx.state.user._id;
            try {
                await newUGO.save();
            } catch (err) {
                ctx.throw(400);
                return;
            }
        }

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + UGO + _IMPORT + _SUCCESS);
        });

        ctx.type = 'json';

        ctx.status = 204;
    }
};

exports.create = async ctx => {
    const permission = abac.can(ctx.state.user.role).createAny('ugo');

    let ugoCandidate = ctx.request.body;

    if (permission.granted) {

        let newUGO                  = new Ugo(ugoCandidate);
            newUGO.last_updated_by  = ctx.state.user._id;

        if (ctx.request.body.files) newUGO.img = ctx.request.body.files[0];

        await newUGO.save();

        newUGO = newUGO.toJSON();

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + UGO + _CREATE + _SUCCESS, newUGO);
        });

        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(UGO + MODAL + _HIDE);
            });

        ctx.status = 201;
        ctx.body   = { _id: newUGO._id };

    } else {
        ctx.throw(403);
    }
};

exports.read = async ctx => {
    const permission = abac.can(ctx.state.user.role).readAny('ugo');

    if (permission.granted) {
        ctx.body = await Ugo.find().sort('-title').lean().exec();
    } else {
        ctx.throw(403);
    }
};

exports.update = async ctx => {
    let ugoCandidate = ctx.request.body;

    const permission = abac.can(ctx.state.user.role).updateAny('ugo');

    if (permission.granted) {
        if (!ugoCandidate) ctx.throw(400);

        ugoCandidate.last_updated_by   = ctx.state.user._id;
        ugoCandidate.last_updated_at   = Date.now();

        delete ugoCandidate.created_at;
        delete ugoCandidate.created_by;

        let ugo = await Ugo.findOne({ _id: ctx.params.id });

        if (!ugo) ctx.throw(400);

        for (let k in ugoCandidate) {
            ugo[k] = ugoCandidate[k];
        }

        if (Array.isArray(ctx.request.body.files) && ctx.request.body.files[0]) ugo.img = ctx.request.body.files[0];

        await ugo.save();

        // await Ugo.update({ _id: ctx.params.id, role: ugoCandidate.role }, { $set: ugoCandidate });

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + UGO + _UPDATE + _SUCCESS, ugo.toJSON());
        });
        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
        userSocketSessionIds.forEach(s_id => {
            Socket.emitter.of('/api').to(s_id).emit(UGO + MODAL + _HIDE);
        });

        ctx.type = 'json';

        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};

exports.delete = async ctx => {
    const permission = abac.can(ctx.state.user.role).deleteAny('ugo');

    if (permission.granted) {
        await Ugo.remove({ _id: ctx.params.id });

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + UGO + _DELETE + _SUCCESS, { _id: ctx.params.id });
        });

        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};