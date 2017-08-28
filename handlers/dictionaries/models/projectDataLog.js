/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===       PROJECT MODEL      ===
 ================================
 */

'use strict';

const mongoose = require('../../../libs/mongoose');

const projectDataLogSchema = new mongoose.Schema({
        p_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        d_id: { type: String, required: 'CANNOT_IDENT_DEVICE' },
        s_id: { type: String, required: true },
        r: { type: String, required: true },
        r_v: { type: Number },
        dt: { type: Date, required: true, default: Date.now }
    },
    {
        capped: 1024 * 1024 * 1024, // 1Gb
        versionKey: false,
        autoIndex: false,
        id: false,
        minimize: false,
        retainKeyOrder: false
    });


module.exports = mongoose.model('ProjectDataLog', projectDataLogSchema);