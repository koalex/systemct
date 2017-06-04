/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

const config        = require('config');
const Sensor        = require('../models/sensor');
const AccessControl = require('accesscontrol');
const abac          = new AccessControl(/*grants*/);
const Socket        = require('../../../libs/socket');

const { _CREATE, _READ, _UPDATE, _DELETE, _SUCCESS, _ERROR } = require(config.actionsRoot);

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


exports.create = async ctx => {
    const permission = abac.can(ctx.state.user.role).createAny('sensor');

    let sensorCandidate = ctx.request.body.sensor;

    if (permission.granted) {

        let newSensor = new Sensor(sensorCandidate);

        await newSensor.save();

        newSensor = newSensor.toJSON();

        /*config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(_CREATE + _SUCCESS, newSensor);
        });*/

        ctx.status = 201;
        ctx.body   = { _id: newSensor._id };

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