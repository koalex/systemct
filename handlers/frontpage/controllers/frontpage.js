/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
 /*
   ================================
   ===       MODULE NAME       ====
   ================================
*/

'use strict';

const config      = require('config');
const fs          = require('fs');
const join        = require('path').join;
const pkg         = require(join(config.projectRoot, 'package.json'));

module.exports = async ctx => {

    ctx.type = 'html';
    ctx.render('index', {
        PAGE_TTILE: ctx.i18n.__('frontpage.PAGE_TITLE'),
        APP_DESCRIPTION: ctx.i18n.__('frontpage.APP_DESCRIPTION'),
        COPYRIGHT: ctx.i18n.__('frontpage.COPYRIGHT'),
        CITY: ctx.i18n.__('frontpage.CITY'),
        COUNTRY: ctx.i18n.__('frontpage.COUNTRY'),
        STREET_ADDRESS: ctx.i18n.__('frontpage.STREET_ADDRESS'), // Карла Маркса 7
        PLACENAME: ctx.i18n.__('frontpage.PLACENAME'), // город Новосибирск, Россия
        REGION: ctx.i18n.__('frontpage.REGION'), // RU-город Новосибирск
        author: pkg.author.name,
        homepage: pkg.homepage,
        appName: pkg.name,

    });
};