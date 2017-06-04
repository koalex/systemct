/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===        USER MODEL        ===
 ================================
*/

'use strict';

const fs       = require('fs');
const mongoose = require('../../../libs/mongoose');
const history  = require('mongoose-version');
const crypto   = require('crypto');
const config   = require('config');
const uuid     = require('uuid');
const moment   = require('moment');

const userSchema = new mongoose.Schema({
    active: { type: Boolean, default: true/*false for confirmation*/, required: true },
    locked_until: { type: Date },
    immortal: { type: Boolean, default: false },
    name: { type: String, trim: true },
    patronymic: { type: String, trim: true },
    surname: { type: String, trim: true },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: { type: String },
    role: { type: String },
    phone: { type: String, trim: true },
    skype: { type: String, trim: true },
    accounts: {
        vk               : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        },
        facebook         : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        },
        twitter          : {
            id           : String,
            token        : String,
            displayName  : String,
            username     : String
        },
        google           : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        }
    },
    settings: { },
    push_id: { type: String },
    password_reset_token: { type: String },
    password_reset_expiration: { type: Date },
    email_confirmation_token: { type: String, default: uuid() }, // FIXME: uuid() or uuid ?
    token_uuid: { type: String },
    password_hash: { type: String, required: true },
    signin_attempts: { type: Number, required: true, default: 0 },
    salt: { required: true, type: String },
    created_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    last_activity: { type: Date, default: Date.now },
    last_updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    last_updated_at: { type: Date, required: true, default: Date.now },
    last_ip_address: { type: String },

    // for transactions implementation
    updated: { type: mongoose.Schema.Types.Mixed, default: null },
    tx: { type: mongoose.Schema.Types.ObjectId, default: null }
},
{
    versionKey: false,
    autoIndex: true,
    id: false,
    minimize: true,
    // safe: { j: 1, w: 2, wtimeout: 10000 }, // only if replica
    retainKeyOrder: true
});


userSchema.virtual('locked')
    .get(function ()  { return moment(this.locked_until).diff(moment(), 'seconds') > 1 });

userSchema.virtual('passwordConfirmation')
    .set(function (v) { this._passwordConfirmation = v; })
    .get(function ()  { return this._passwordConfirmation; });

userSchema.virtual('password')
    .set(function (password) {
        if (!password || String(password).trim() === '') {
            this.invalidate('password', 'PASSWORD_REQUIRED');
            return;
        }
        this._password     = password;
        this.salt          = crypto.randomBytes(config.crypto.hash.length).toString('base64');
        this.password_hash = crypto.pbkdf2Sync(password, this.salt, config.crypto.hash.iterations, config.crypto.hash.length, 'sha512');
    })
    .get(function () { return this._password; });

userSchema.methods.checkPassword = function (password) {
    if (!password) return false;
    if (!this.password_hash) return false;
    return String(crypto.pbkdf2Sync(password, this.salt, config.crypto.hash.iterations, config.crypto.hash.length, 'sha512')) === this.password_hash;
};

const MAX_ATTEMPTS          = 3;
const BLOCK_TIME            = 2 * 60 * 60 * 1000; // 2 hour
const IMMORATL_BLOCK_TIME   = 86400000 * 365 * 100; // 100 years

userSchema.methods.incSigninAttempts = function (clear, cb) {
    if (!cb) cb = err => { if (err) console.log(err) };

    if (clear) {
        return this.model('User').findOneAndUpdate({ _id: this._id }, {
            $set: { signin_attempts: 0 },
            $unset: { locked_until: new Date(1) }
        }, cb);
    } else if (this.locked) {
        return this.model('User').findOneAndUpdate({ _id: this._id }, {
            $inc: { signin_attempts: 1 },
            $set: { locked_until: new Date(Date.now() + (this.immortal ? IMMORATL_BLOCK_TIME : BLOCK_TIME)) }
        }, cb);
    } else if (!this.locked && this.signin_attempts == MAX_ATTEMPTS - 1) {
        return this.model('User').findOneAndUpdate({ _id: this._id }, {
            $inc: { signin_attempts: 1 },
            $set: { locked_until: new Date(Date.now() + (this.immortal ? IMMORATL_BLOCK_TIME : BLOCK_TIME)) }
        }, cb);
                                // 2    +2
    } else if (!this.locked && this.signin_attempts < MAX_ATTEMPTS) {
        return this.model('User').findOneAndUpdate({ _id: this._id }, {
            $inc: { signin_attempts: 1 },
            $unset: { locked_until: new Date(1) }
        }, cb);

    } else if (!this.locked && this.signin_attempts > (MAX_ATTEMPTS - 1)) {
        return this.model('User').findOneAndUpdate({ _id: this._id }, {
            $set: { signin_attempts: 0 },
            $unset: { locked_until: new Date(1) }
        }, cb);

    }
};

userSchema.path('password_hash').validate(function (v) {
    // let validateMessages = [];

    if (this._password || this._passwordConfirmation) {

        if (this._password.length < 6) this.invalidate('password', 'MIN_6_CHAR');/*validateMessages.push('MIN_6_CHAR');*/
        if (this._password.length > 20) this.invalidate('password', 'MAX_20_CHAR');/*validateMessages.push('MAX_20_CHAR');*/
        if (!/([0-9]{1,})/.test(this._password)) this.invalidate('password', 'MUST_CONTAINS_DIGIT');/*validateMessages.push('MUST_CONTAINS_DIGIT');*/
        if (!/([a-zа-яA-ZА-Я]{1,})/.test(this._password)) this.invalidate('password', 'MUST_CONTAINS_LETTER');/*validateMessages.push('MUST_CONTAINS_LETTER');*/
        if (this._password !== this._passwordConfirmation) this.invalidate('password', 'PASSWORDS_DO_NOT_MATCH');/*validateMessages.push('PASSWORDS_DO_NOT_MATCH');*/

        // if (validateMessages.length !== 0) this.invalidate('password', validateMessages.join(', '));

    }
}, null);

userSchema.path('name').validate(function (v) {
    if (!v || String(v).trim() === '') this.invalidate('name', 'NAME_REQUIRED');
    if (v.length > 100) this.invalidate('name', 'NAME_TO_LONG');
}, null);

userSchema.path('patronymic').validate(function (v) {
    // if (!v || String(v).trim() === '') this.invalidate('patronymic', 'PATRONYMIC_REQUIRED');
    if (v && v.length > 100) this.invalidate('patronymic', 'PATRONYMIC_TO_LONG');
}, null);



userSchema.path('surname').validate(function (v) {
    if (!v || String(v).trim() === '') this.invalidate('surname', 'SURNAME_REQUIRED');
    if (v.length > 100) this.invalidate('surname', 'SURNAME_TO_LONG');
}, null);

userSchema.path('email').validate(function (v) {
    if (!v || String(v).trim() === '') this.invalidate('email', 'EMAIL_REQUIRED');
    if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v)) this.invalidate('email', 'WRONG_EMAIL');
}, null);

/*
userSchema.path('phone').validate(function (v) {
    if (!v || String(v).trim() === '') this.invalidate('phone', 'PHONE_REQUIRED');
    if (v.length > 20 || v.length < 4 || !String(v).match(/\d/g) || String(v).match(/\d/g).length < 4 || String(v).match(/\d/g).length > 20) this.invalidate('phone', 'WRONG_PHONE');
}, null);
*/

userSchema.path('role').validate(function (v) {
    if (!v || String(v).trim() === '') this.invalidate('role', 'ROLE_REQUIRED');
    if (!config.roles.some(role => role === v)) this.invalidate('role', 'WRONG_ROLE');
}, null);

userSchema.methods.toJSON = function () {
    let data = this.toObject();
    delete data.updated;
    delete data.tx;
    delete data.password_hash;
    delete data.salt;
    delete data.email_confirmation_token;
    delete data.password_reset_token;
    delete data.password_reset_expiration;
    if (data.locked_until) data.locked_until = String(data.locked_until);
    data.last_activity = String(data.last_activity);
    data.last_updated_at = String(data.last_updated_at);
    data._id = String(data._id);

    return data;
};

userSchema.plugin(history, {
    collection: 'users_history',
    suppressVersionIncrement: true,
    suppressRefIdIndex: false,
    strategy: 'array',
    ignorePaths: [
        'last_ip_address',
        'last_activity',
        'salt',
        'push_id',
        'token_uuid',
        'password_reset_token',
        'password_reset_expiration',
        'email_confirmation_token',
        'updated',
        'tx'
    ]
});

module.exports = mongoose.model('User', userSchema);