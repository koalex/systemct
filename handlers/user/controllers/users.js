'use strict';

const config        = require('config');
const User          = require('../models/user');
const AccessControl = require('accesscontrol');
const abac          = new AccessControl(/*grants*/);
const Socket        = require('../../../libs/socket');

const { USERS, MODAL, _HIDE, _CREATE, _READ, _UPDATE, _DELETE, _SUCCESS, _ERROR } = require(config.actionsRoot);

/*const grants = {
    superuser: {
        user: {
            "create:any": [],
            "read:any": [],
            "update:any": [],
            "delete:any": []
        }
    },
    admin: {
        admin: {
            "create:any": [],
            "read:any": [],
            "update:any": [],
            "delete:any": []
        },
        manager: {
            "create:any": [],
            "read:any": [],
            "update:any": [],
            "delete:any": []
        }
    }
};*/

// abac.deny().role('admin').createAny('profile');

abac.grant('superuser').createAny(config.roles.filter(role => role !== 'superuser')).readAny(config.roles).updateAny(config.roles.filter(role => role !== 'superuser')).deleteAny(config.roles.filter(role => role !== 'superuser'));
abac.grant('admin')
    .createAny(config.roles.filter(role => role !== 'superuser'))
    .readAny(config.roles.filter(role => role !== 'superuser'))
    .updateAny(config.roles.filter(role => role !== 'superuser'))
    .deleteAny(config.roles.filter(role => role !== 'superuser'));

const userFixtures = require('../fixtures/user');

exports.__INIT__ = async ctx => {

    for (let i = 0, l = userFixtures.length; i < l; i++) {
        let newUser = new User(userFixtures[i]);
        newUser.created_at       = Date.now();
        newUser.last_updated_at  = Date.now();

        await newUser.save();

        newUser.created_by       = newUser._id;
        newUser.last_updated_by  = newUser._id;

        await newUser.save();
    }

    ctx.status = 201;
    ctx.body   = userFixtures;
};

exports.getAll = async ctx => {
    const allowTo = abac.can(ctx.state.user.role);

    if (allowTo.readAny('superuser').granted) {
        ctx.body = await User.find();
    } else if (allowTo.readAny('admin').granted) {
        ctx.body = await User.find({ role: { $in: config.roles.filter(role => role !== 'superuser') } }).exec();
    } else {
        ctx.throw(403);
    }
};

exports.create = async ctx => {

    let userCandidate           = ctx.request.body.user;
        userCandidate.password  = userCandidate.password;

    if (!userCandidate.role) ctx.throw(400);

    const permission = abac.can(ctx.state.user.role).createAny(userCandidate.role);

    if (permission.granted) {
        if (!userCandidate) ctx.throw(400);

        userCandidate.active           = true;
        userCandidate.created_by       = ctx.state.user._id;
        userCandidate.created_at       = Date.now();
        userCandidate.last_updated_by  = ctx.state.user._id;
        userCandidate.last_updated_at  = Date.now();
        userCandidate.immortal         = false;

        let newUser = new User(userCandidate);

        await newUser.save();

        newUser = newUser.toJSON();

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(USERS + _CREATE + _SUCCESS, newUser);
        });

        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(USERS + MODAL + _HIDE);
            });
        // Socket.emitter.of('/api').to(String(ctx.state.user._id)).emit(USERS + MODAL + _HIDE);

        ctx.status = 201;
        ctx.body   = { _id: newUser._id };
    } else {
        ctx.throw(403);
    }
};

exports.update = async ctx => {
    let userCandidate = ctx.request.body.user;

    if (!userCandidate.role) ctx.throw(400);

    const permission = abac.can(ctx.state.user.role).updateAny(userCandidate.role);

    if (permission.granted) {
        if (!userCandidate) ctx.throw(400);

        userCandidate.last_updated_by   = ctx.state.user._id;
        userCandidate.last_updated_at   = Date.now();
        userCandidate.immortal          = false;

        delete userCandidate.created_at;
        delete userCandidate.last_activity;
        delete userCandidate.created_by;

        let user = await User.findOne({ _id: ctx.params.id });

        if (!user) ctx.throw(400);

        if (userCandidate.locked_until == null) {
            await user.incSigninAttempts(true);
            delete user.locked_until;
        }

        for (let k in userCandidate) {
            user[k] = userCandidate[k];
        }

        await user.save();

        // await User.update({ _id: ctx.params.id, role: userCandidate.role }, { $set: userCandidate });

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(USERS + _UPDATE + _SUCCESS, user.toJSON());
        });
        let userSocketSessionIds = await Socket.session_ids(ctx.state.token);
            userSocketSessionIds.forEach(s_id => {
                Socket.emitter.of('/api').to(s_id).emit(USERS + MODAL + _HIDE);
            });

        ctx.type = 'json';

        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};

exports.delete = async ctx => {
    if (String(ctx.state.user._id) === ctx.params.id) ctx.throw(403);

    let user = await User.findOne({ _id: ctx.params.id });

    if (!user || !user.role) ctx.throw(400);

    if (user.immortal === true) {
        ctx.throw(403);
        return;
    }

    const permission = abac.can(ctx.state.user.role).deleteAny(user.role);

    if (permission.granted) {
        await User.remove({ _id: ctx.params.id });

        config.roles.filter(role => role !== 'manager').forEach(role => {
            Socket.emitter.of('/api').to(role).emit(USERS + _DELETE + _SUCCESS, { _id: ctx.params.id });
        });

        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};

exports.getMe = async ctx => { ctx.body = ctx.state.user; };

exports.getOne = async ctx => { ctx.body = await User.findOne({ _id: ctx.params.id }); };

