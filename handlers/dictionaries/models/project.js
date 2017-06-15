/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===       PROJECT MODEL       ===
 ================================
 */

'use strict';

const mongoose = require('../../../libs/mongoose');
const history  = require('mongoose-version');

const projectSchema = new mongoose.Schema({
        title: { type: String, trim: true, required: 'PROJECT_TITLE_REQUIRED' },
        devices: [{
            default: [],
            _id: { type: mongoose.Schema.Types.ObjectId, required: 'CANNOT IDENT_DEVICE' },
            title: { type: String, trim: true, required: 'DEVICE_TITLE_REQUIRED' },
            img: { type: String },
            sensors: [{
                default: [],
                _id: { type: String, required: true },
                title: { type: String },
                img: { type: String },
                dataType: { type: String },
                bytes: { type: Number },
                permission: { type: String },
                registers: [{ type: String }]
            }],
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

projectSchema.methods.toJSON = function () {
    let data = this.toObject();
    delete data.updated;
    delete data.tx;
    data._id             = String(data._id);
    data.last_updated_by = String(data.last_updated_by);
    data.last_updated_at = String(data.last_updated_at);

    return data;
};

projectSchema.plugin(history, {
    collection: 'project_history',
    suppressVersionIncrement: true,
    suppressRefIdIndex: false,
    strategy: 'array',
    ignorePaths: [
        'updated',
        'tx'
    ]
});

module.exports = mongoose.model('Project', projectSchema);