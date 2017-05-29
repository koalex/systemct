/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
/*
 ================================
 ===      DEFAULT CONFIG     ====
 ================================
*/

'use strict';

const join  = require('path').join;

module.exports =  {
             port: process.env.PORT ? process.env.PORT : 3000,
         siteName: 'SYSTEMCT',
         siteDesc: 'SYSTEMCT – electrical equipment monitoring system',
       siteAuthor: 'Konstantin Aleksandrov',
        authorUrl: 'https://github.com/koalex',
      projectRoot: process.cwd(),
       publicRoot: join(process.cwd(), './public'),
      actionsRoot: join(process.cwd(), './client/actions/constants'),
    templatesRoot: join(process.cwd(), './client'),
        filesRoot: join(process.cwd(), '../files'),
           secret: 'eclipse',

    roles: ['superuser', 'admin', 'manager' ],
    defaultLocale: 'ru',
    mongoose: {
        dbName: 'systemct',
        options: {
            server: {
                socketOptions: {
                    keepAlive: 1
                },
                poolSize: 5
            }
        }
    },
    crypto: {
        hash: {
            length: 128
        }
    },

    androidTopColor: '#02a4ec',
    copyright: 'SYSTEMCT'
};


