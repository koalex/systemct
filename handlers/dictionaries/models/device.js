/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===       DEVICE MODEL       ===
 ================================
 */

'use strict';

const mongoose = require('../../../libs/mongoose');
const history  = require('mongoose-version');
const numTypes = require('../../../libs/IEEE754');

const deviceSchema = new mongoose.Schema({
        title: { type: String, trim: true, required: 'DEVICE_TITLE_REQUIRED' },
        sensors: [{
            default: [],
            _id: { type: String, required: true },
            title: { type: String },
            img: { type: String },
            dataType: { type: String, enum: Object.keys(numTypes) },
            type: {
                type: String,
                trim: true,
                required: 'SENSOR_TYPE_REQUIRED',
                lowercase: true,
                enum: ['числовой', 'дискретный']
            },
            permission: { type: String },
            registers: [{ type: String }]
        }],
        img: { type: String },

        last_updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        last_updated_at: { type: Date, required: true, default: Date.now },

        // for transactions implementation
        updated: { type: mongoose.Schema.Types.Mixed, default: null },
        tx: { type: mongoose.Schema.Types.ObjectId, default: null }
    },
    {
        versionKey: false,
        autoIndex: true,
        id: false,
        minimize: true,
        retainKeyOrder: true
    });

deviceSchema.pre('save', function (next) {
    if (Array.isArray(this.sensors) && this.sensors.length) {
        for (let i = 0, l = this.sensors.length; i < l; i++) {
            if (!mongoose.Types.ObjectId.isValid(this.sensors[i]._id)) {
                delete this.sensors[i]._id; // or mongoose.Types.ObjectId()
            }
        }
    }
    next();
});

/*userSchema.virtual('password')
    .set(function (password) {
        if (!password || String(password).trim() === '') {
            this.invalidate('password', 'PASSWORD_REQUIRED');
            return;
        }
        this._password     = password;
        this.salt          = crypto.randomBytes(config.crypto.hash.length).toString('base64');
        this.password_hash = crypto.pbkdf2Sync(password, this.salt, config.crypto.hash.iterations, config.crypto.hash.length, 'sha512');
    })
    .get(function () { return this._password; });*/
// mongoose.Types.ObjectId.isValid('53cb6b9b4f4ddef1ad47f943')

deviceSchema.methods.toJSON = function () {
    let data = this.toObject();
    delete data.updated;
    delete data.tx;
    data._id             = String(data._id);
    data.last_updated_by = String(data.last_updated_by);
    data.last_updated_at = String(data.last_updated_at);

    return data;
};

deviceSchema.plugin(history, {
    collection: 'devices_history',
    suppressVersionIncrement: true,
    suppressRefIdIndex: false,
    strategy: 'array',
    ignorePaths: [
        'updated',
        'tx'
    ]
});

module.exports = mongoose.model('Device', deviceSchema);