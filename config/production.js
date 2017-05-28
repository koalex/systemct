/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
/*
 ================================
 ===    PRODUCTION CONFIG    ====
 ================================
 */

'use strict';

const defer = require('config/defer').deferConfig;

module.exports =  {
    // use systemct
    // db.createUser({user: "systemct",pwd: "U7C8Mo", roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]})
    // db.createUser({user: "defaultUser",pwd: "AXmaHS", roles: [ { role: "readWrite", db: "systemct" } ]})
    mongoose: {
        uri: defer(cfg => { return `mongodb://defaultUser:AXmaHS@localhost:27017/${cfg.mongoose.dbName}`; }),
    },
    crypto: {
        hash: {
            iterations: 12000 // may be slow(!): iterations = 12000 take ~60ms to generate strong password
        }
    }
};


