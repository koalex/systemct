/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===       SENSOR MODEL       ===
 ================================
 */

'use strict';

const mongoose = require('../../../libs/mongoose');
const history  = require('mongoose-version');

const deviceSchema = new mongoose.Schema({
        title: { type: String, trim: true, required: 'DEVICE_TITLE_REQUIRED' },
        sensors: [{
            param: { type: String, trim: true, required: 'REGISTER_PARAM_REQUIRED' }, // or sensor title
            description: { type: String, trim: true },
            dataType: { type: String, trim: true },
            bytes: { type: Number },
            access: { type: String, trim: true },
            note: { type: String, trim: true },
            registers: [{ type: Number }]
        }],

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