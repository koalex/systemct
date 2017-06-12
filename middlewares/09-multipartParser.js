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
const PathListCheck   = require('../modules/pathListCheck/index');

if (!fs.existsSync(config.filesRoot)) fs.mkdirSync(config.filesRoot);

const ignores = [];

class MultipartParser extends PathListCheck {
  constructor () {
    super();
  }

  parse (ctx) {
    return asyncBusboy(ctx.req, {
      autoFields: true,
      limits: {
        fields: 200, // NO-FILE-fields max
        files: 30, // FILE-fields max
        fieldSize: 1000000*200, // MAX FILE SIZE (in bytes) 200MB
        parts: this.fields + this.files, // max files
      }
    });
  }

  middleware () {
    return async (ctx, next) => { };
  }
}
const multipartParser = new MultipartParser();

multipartParser.add(/\/api\/v?[0-9]{0,2}\/?dictionaries\/ugo\/?[a-z0-9]*/);
multipartParser.add(/\/api\/v?[0-9]{0,2}\/?dictionaries\/sensors\/?[a-z0-9]*/);
multipartParser.ignore.add(/\/api\/v?[0-9]{0,2}\/?dictionaries\/[a-z]{1,100}\/import/);

module.exports = async (ctx, next) => {
  ctx.multipartParser = multipartParser;

  let contentType = ctx.get('content-type') || '';

  if (multipartParser.ignore.check(ctx.path) || !ctx.multipartParser.check(ctx.path) || !~['DELETE', 'POST', 'PUT', 'PATCH'].indexOf(ctx.method) || !contentType.startsWith('multipart/form-data')) {
    return await next();
  }

  const { files, fields } = await ctx.multipartParser.parse(ctx);

  if (files && files.length > 0) {

    let fileNames       = [];
    let hashedFilenames = true;

    for (let i = 0, l = files.length; i < l; ++i) {
      await new Promise(resolve => {
        let filename = files[i].filename;
        let ext      = extname(files[i].filename);

        if (hashedFilenames) filename = crypto.createHash('md5').update(uuid.v1()).digest('hex').slice(0,9) + ext;

        files[i].pipe(fs.createWriteStream(join(config.filesRoot, filename)));

        files[i].on('end', () => {
          fileNames.push('/uploads/' + filename);
          resolve();
        })
      });
    }

    ctx.request.body.files = fileNames;

  }

  for (let key in fields) ctx.request.body[key] = fields[key];

  await next();
};