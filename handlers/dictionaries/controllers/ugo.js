/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

const config        = require('config');
const UGO           = require('../models/ugo');
const AccessControl = require('accesscontrol');
const abac          = new AccessControl(/*grants*/);
const Socket        = require('../../../libs/socket');

const { _CREATE, _READ, _UPDATE, _DELETE, _SUCCESS, _ERROR } = require(config.actionsRoot);

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


exports.create = async ctx => {
    const permission = abac.can(ctx.state.user.role).createAny('ugo');

    let ugoCandidate = ctx.request.body.ugo;

    if (permission.granted) {

        let newUGO = new UGO(ugoCandidate);

        await newUGO.save();

        newUGO = newUGO.toJSON();

        /*config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(_CREATE + _SUCCESS, newUGO);
        });*/

        ctx.status = 201;
        ctx.body   = { _id: newUGO._id };

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