/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

'use strict';

const mongoose = require('../../../libs/mongoose');
const history  = require('mongoose-version');

const ugoSchema = new mongoose.Schema({
        title: { type: String, trim: true, required: 'UGO_TITLE_REQUIRED' },
        img: { data: Buffer, contentType: String },
        description: { type: String, trim: true },

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

ugoSchema.methods.toJSON = function () {
    let data = this.toObject();
    delete data.updated;
    delete data.tx;
    data._id             = String(data._id);
    data.last_updated_by = String(data.last_updated_by);
    data.last_updated_at = String(data.last_updated_at);

    return data;
};

ugoSchema.plugin(history, {
    collection: 'ugo_history',
    suppressVersionIncrement: true,
    suppressRefIdIndex: false,
    strategy: 'array',
    ignorePaths: [
        'updated',
        'tx'
    ]
});

module.exports = mongoose.model('UGO', ugoSchema);