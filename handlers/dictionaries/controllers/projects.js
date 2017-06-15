/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

const fs            = require('fs');
const tar           = require('tar-fs');
const path          = require('path');
const basename      = path.basename;
const extname       = path.extname;
const join          = path.join;
const config        = require('config');
const archiver      = require('archiver');
const modbus     = require('jsmodbus');

const Project       = require('../models/project');
const AccessControl = require('accesscontrol');
const abac          = new AccessControl(/*grants*/);
const Socket        = require('../../../libs/socket');

const { DICTIONARY, UGO, SENSOR, PROJECT, PROJECT, MODAL, _CREATE, _READ, _UPDATE, _DELETE, _IMPORT, _EXPORT, _SUCCESS, _ERROR, _HIDE } = require(config.actionsRoot);

abac.grant('superuser')
    .createAny('project')
    .readAny('project')
    .updateAny('project')
    .deleteAny('project');

abac.grant('admin')
    .createAny('project')
    .readAny('project')
    .updateAny('project')
    .deleteAny('project');

abac.grant('manager')
    .readAny('project');


const modbusConnect = params => {
    return new Promise((resolve, reject) => {
        let client = modbus.client.tcp.complete({
            'host'              : params.ip,
            'port'              : params.port,
            'autoReconnect'     : false, // true for service
            'reconnectTimeout'  : 1000,
            'timeout'           : 5000,
            'unitId'            : 1
        });

        client.connect();
        // reconnect with client.reconnect()

        client.on('connect', () => { resolve(client); });
        client.on('connect', err => { reject(err); });
    });
};


exports.create = async ctx => {
    const permission = abac.can(ctx.state.user.role).createAny('project');

    let projectCandidate = ctx.request.body;

    if (permission.granted) {

        let newProject                  = new Device(projectCandidate);
            newProject.last_updated_by  = ctx.state.user._id;

        if (ctx.request.body.files) newProject.img = ctx.request.body.files[0];

        await newProject.save();

        newProject = newProject.toJSON();

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + PROJECT + _CREATE + _SUCCESS, newProject);
        });

        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(PROJECT + MODAL + _HIDE);
            });

        ctx.status = 201;
        ctx.body   = { _id: newProject._id };

    } else {
        ctx.throw(403);
    }
};

exports.read = async ctx => {
    const permission = abac.can(ctx.state.user.role).readAny('project');

    if (permission.granted) {
        ctx.body = await Project.find().sort('title').lean().exec();
    } else {
        ctx.throw(403);
    }
};

exports.update = async ctx => {
    let projectCandidate = ctx.request.body.body || ctx.request.body;

    const permission = abac.can(ctx.state.user.role).updateAny('project');

    if (permission.granted) {
        if (!projectCandidate) ctx.throw(400);

        projectCandidate.last_updated_by   = ctx.state.user._id;
        projectCandidate.last_updated_at   = Date.now();

        delete projectCandidate.created_at;
        delete projectCandidate.created_by;

        let project = await Project.findOne({ _id: ctx.params.id });

        if (!project) ctx.throw(400);

        for (let k in projectCandidate) {
            project[k] = projectCandidate[k];
            if (!project[k]) project[k] = projectCandidate[k];
        }

        if (Array.isArray(ctx.request.body.files) && ctx.request.body.files[0]) project.img = ctx.request.body.files[0];

        await project.save();

        // await Sensor.update({ _id: ctx.params.id, role: projectCandidate.role }, { $set: projectCandidate });

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + PROJECT + _UPDATE + _SUCCESS, project.toJSON());
        });
        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(PROJECT + MODAL + _HIDE);
            });

        ctx.type = 'json';

        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};

exports.delete = async ctx => {
    const permission = abac.can(ctx.state.user.role).deleteAny('project');

    if (permission.granted) {
        await Project.remove({ _id: ctx.params.id });

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(DICTIONARY + PROJECT + _DELETE + _SUCCESS, { _id: ctx.params.id });
        });

        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(PROJECT + MODAL + _HIDE);
            });

        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};