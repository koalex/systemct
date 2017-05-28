/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
 /* 
   ================================
   ===        DEV CONFIG       ====
   ================================ 
*/

'use strict';

global.__DEVELOPMENT__ = process.env.NODE_ENV === 'development';
const defer         = require('config/defer').deferConfig;

module.exports = {
    mongoose: {
        uri: defer(cfg => { return `mongodb://defaultUser:AXmaHS@localhost:27017/${cfg.mongoose.dbName}`; }),
        options: {
            server: {
                socketOptions: {
                    connectTimeoutMS: __DEVELOPMENT__ ? 10000 : 0,
                    socketTimeoutMS: __DEVELOPMENT__ ? 10000 : 0
                },
                poolSize: 5
            }
        }
    },
    crypto: {
        hash: {
            iterations: 1
        }
    }
};


