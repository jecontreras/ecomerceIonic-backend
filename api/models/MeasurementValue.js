/**
 * MeasurementValue.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    type: { model: 'measurementtype', required: true },

    value: { type: 'string', required: true }

  }

};
