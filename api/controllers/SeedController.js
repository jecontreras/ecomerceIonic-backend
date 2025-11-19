/**
 * SeedController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  run: async function (req, res) {
    try {
      await sails.helpers.bootstrapScript('seed');
      return res.ok({ message: 'Seed ejecutado correctamente.' });
    } catch (err) {
      return res.serverError(err);
    }
  }

};
