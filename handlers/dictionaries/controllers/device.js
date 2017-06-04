/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

const config        = require('config');
const Device        = require('../models/device');
const AccessControl = require('accesscontrol');
const abac          = new AccessControl(/*grants*/);
const Socket        = require('../../../libs/socket');

const { _CREATE, _READ, _UPDATE, _DELETE, _SUCCESS, _ERROR } = require(config.actionsRoot);

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


exports.create = async ctx => {
    const permission = abac.can(ctx.state.user.role).createAny('device');

    let deviceCandidate = ctx.request.body.device;

    if (permission.granted) {

        let newDevice = new Device(deviceCandidate);

        await newDevice.save();

        newDevice = newDevice.toJSON();

        /*config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(_CREATE + _SUCCESS, newDevice);
        });*/

        ctx.status = 201;
        ctx.body   = { _id: newDevice._id };

    } else {
        ctx.throw(403);
    }
};

exports.read = async ctx => {

};

exports.update = async ctx => {

};

exports.delete = async ctx => {

};