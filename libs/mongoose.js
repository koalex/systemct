/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===   MONGOOSE CONNECTION    ===
 ================================
*/

'use strict';

const config            = require('config');
const CLS               = require('continuation-local-storage');
const clsMongoose       = require('cls-mongoose');
const ns                = CLS.getNamespace('logger');
const mongoose          = require('mongoose');
const uniqueValidator   = require('mongoose-unique-validator'); // не надежно, написать валидатор уникальности

if (ns) clsMongoose(ns);

if (process.env.MONGOOSE_DEBUG) mongoose.set('debug', true);

mongoose.Promise = global.Promise;

if (__DEVELOPMENT__) {
    mongoose.model = new Proxy(mongoose.model, {
        apply: function (target, thisArg, argumentsList) {
            if (mongoose.models[argumentsList[0]]) delete mongoose.models[argumentsList[0]];
            if (mongoose.modelSchemas[argumentsList[0]]) delete mongoose.modelSchemas[argumentsList[0]];
            if (mongoose.connection.collections[argumentsList[0]]) delete mongoose.connection.collections[argumentsList[0]];
            if (mongoose.connection.models[argumentsList[0]]) delete mongoose.connection.models[argumentsList[0]];

            return target.apply(thisArg, argumentsList);
        }
    });
}

mongoose.connect(config.mongoose.uri, config.mongoose.options);

mongoose.plugin(uniqueValidator);

module.exports = mongoose;





// TODO: написать валидатор уникальности
/*mongoose.plugin(function(schema) { // каждая схема получит эту обработку

  schema.methods.persist = function(body) { // в каждую схему будет добавлен метод persist
    var model = this;

    return function(callback) {
      if (body) model.set(body);
      model.save(function(err, changed) {

        if (!err || err.code != 11000) {
          return callback(err, changed);
        }

        this.log.trace("uniqueness error", err);
        this.log.trace("will look for indexName in message", err.message);


        let indexName = err.message.match(/\$(\w+)/);
        indexName = indexName[1];

        model.collection.getIndexes(function(err2, indexes) {
          if (err2) return callback(err);

          let indexInfo = indexes[indexName];

          let indexFields = {};
          indexInfo.forEach(function toObject(item) {
            indexFields[item[0]] = item[1];
          });

          let schemaIndexes = schema.indexes();

          let schemaIndex = null;

          for (let i = 0; i < schemaIndexes.length; i++) {
            if (_.isEqual(schemaIndexes[i][0], indexFields)) {
              schemaIndex = schemaIndexes[i];
              break;
            }
          }

          this.log.trace("Schema index which failed:", schemaIndex);

          let errorMessage;
          if (!schemaIndex) {
            if (indexName == '_id_') {
              errorMessage = 'Id is not unique';
            } else {
              return callback(new Error("index " + indexName + " in DB, but not in schema"));
            }
          } else {

            let schemaIndexInfo = schemaIndex[1];

            errorMessage = schemaIndexInfo.errorMessage || ("Index error: " + indexName);

          }

          let valError = new ValidationError(err); // TODO: написать валидатор

          let field = indexInfo[0][0]; // if many fields in uniq index - we take the 1st one for error

          this.log.trace("Generating error for field", field, ':', errorMessage);

          valError.errors[field] = new ValidatorError({ // TODO: написать валидатор
            path: "email",
            message: errorMessage,
            type: 'notunique',
            value: model[field]
          });

          valError.code = err.code; // if (err.code == 11000) in the outer code will still work

          return callback(valError);
        });

      });
    };
  };

});*/
