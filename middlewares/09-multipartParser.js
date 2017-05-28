/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===      MULTIPART PARSE     ===
 ================================
*/

'use strict';

const fs              = require('fs');
const extname         = require('path').extname;
const config          = require('config');
const join            = require('path').join;
const asyncBusboy     = require('async-busboy');
const crypto          = require('crypto');
const uuid            = require('uuid');

if (!fs.existsSync(config.filesRoot)) fs.mkdirSync(config.filesRoot);

module.exports = async (ctx, next) => {
  let contentType = ctx.get('content-type') || '';

  if (!~['DELETE', 'POST', 'PUT', 'PATCH'].indexOf(ctx.method) || !contentType.startsWith('multipart/form-data')) {
    return await next();
  }

  const { files, fields } = await asyncBusboy(ctx.req, {
    autoFields: true,
    limits: {
      fields: 200, // NO-FILE-fields max
      files: 30, // FILE-fields max
      fieldSize: 1000000*3, // MAX FILE SIZE (in bytes) 3MB
      parts: this.fields + this.files, // max files
    }
  });

  if (files && files.length > 0) {

    let fileNames       = [];
    let hashedFilenames = false;

    for (let i = 0, l = files.length; i < l; ++i) {
      await new Promise(resolve => {
        let filename = files[i].filename;
        let ext      = extname(files[i].filename);


        if (hashedFilenames) filename = crypto.createHash('md5').update(uuid.v1()).digest('hex').slice(0,9) + ext;

        files[i].pipe(fs.createWriteStream(join(config.filesRoot, filename)));

        files[i].on('end', () => {
          fileNames.push('/files/' + filename);
          resolve();
        })
      });
    }

    ctx.request.body.files = fileNames;

  }

  for (let key in fields) ctx.request.body[key] = fields[key];

  await next();
};